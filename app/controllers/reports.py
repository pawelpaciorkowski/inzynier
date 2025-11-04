from flask import Blueprint, request, jsonify, make_response
from app.middleware import require_auth
from app.database import db
from sqlalchemy import text
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import io
import csv
import xlsxwriter
from datetime import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/groups/<int:group_id>/customers', methods=['GET'])
@require_auth
def get_group_customers(group_id):
    """Pobiera klientów przypisanych do grupy"""
    try:
        query = text("""
            SELECT Id, Name, Email, Phone, Company, Address, AssignedGroupId
            FROM Customers 
            WHERE AssignedGroupId = :group_id
        """)
        result = db.session.execute(query, {'group_id': group_id})
        customers = []
        for row in result:
            customers.append({
                'id': row.Id,
                'name': row.Name,
                'email': row.Email,
                'phone': row.Phone,
                'company': row.Company,
                'address': row.Address,
                'assignedGroupId': row.AssignedGroupId
            })
        return jsonify(customers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/groups/<int:group_id>/sales', methods=['GET'])
@require_auth
def get_group_sales(group_id):
    """Pobiera dane sprzedażowe dla grupy"""
    try:
        # Liczba faktur dla klientów w grupie
        invoices_query = text("""
            SELECT COUNT(*) as totalInvoices, 
                   COALESCE(SUM(TotalAmount), 0) as totalAmount,
                   COALESCE(SUM(CASE WHEN IsPaid = 1 THEN TotalAmount ELSE 0 END), 0) as paidAmount,
                   COALESCE(SUM(CASE WHEN IsPaid = 0 THEN TotalAmount ELSE 0 END), 0) as unpaidAmount,
                   SUM(CASE WHEN IsPaid = 1 THEN 1 ELSE 0 END) as paidCount,
                   SUM(CASE WHEN IsPaid = 0 THEN 1 ELSE 0 END) as unpaidCount
            FROM Invoices i
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
        """)
        result = db.session.execute(invoices_query, {'group_id': group_id}).fetchone()
        
        # Lista faktur
        invoices_list_query = text("""
            SELECT i.Id, i.Number, i.TotalAmount, i.IsPaid, i.IssuedAt, c.Name as CustomerName
            FROM Invoices i
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
            ORDER BY i.IssuedAt DESC
        """)
        invoices_result = db.session.execute(invoices_list_query, {'group_id': group_id})
        invoices = []
        for row in invoices_result:
            invoices.append({
                'id': row.Id,
                'invoiceNumber': row.Number,
                'totalAmount': float(row.TotalAmount),
                'isPaid': bool(row.IsPaid),
                'issuedAt': row.IssuedAt.isoformat() if row.IssuedAt else None,
                'customerName': row.CustomerName
            })
        
        return jsonify({
            'totalInvoices': result.totalInvoices,
            'totalAmount': float(result.totalAmount),
            'paidAmount': float(result.paidAmount),
            'unpaidAmount': float(result.unpaidAmount),
            'paidCount': result.paidCount,
            'unpaidCount': result.unpaidCount,
            'invoices': invoices
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/groups/<int:group_id>/tasks', methods=['GET'])
@require_auth
def get_group_tasks(group_id):
    """Pobiera zadania dla grupy"""
    try:
        # Statystyki zadań
        stats_query = text("""
            SELECT COUNT(*) as totalTasks,
                   SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) as completedTasks,
                   SUM(CASE WHEN Completed = 0 THEN 1 ELSE 0 END) as pendingTasks
            FROM Tasks t
            INNER JOIN Customers c ON t.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
        """)
        result = db.session.execute(stats_query, {'group_id': group_id}).fetchone()
        
        # Lista zadań
        tasks_list_query = text("""
            SELECT t.Id, t.Title, t.Description, t.Completed, t.DueDate, c.Name as CustomerName
            FROM Tasks t
            INNER JOIN Customers c ON t.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
            ORDER BY t.DueDate ASC
        """)
        tasks_result = db.session.execute(tasks_list_query, {'group_id': group_id})
        tasks = []
        for row in tasks_result:
            tasks.append({
                'id': row.Id,
                'title': row.Title,
                'description': row.Description,
                'completed': bool(row.Completed),
                'dueDate': row.DueDate.isoformat() if row.DueDate else None,
                'customerName': row.CustomerName
            })
        
        completion_rate = (result.completedTasks / result.totalTasks * 100) if result.totalTasks > 0 else 0
        
        return jsonify({
            'totalTasks': result.totalTasks,
            'completedTasks': result.completedTasks,
            'pendingTasks': result.pendingTasks,
            'completionRate': round(completion_rate, 2),
            'tasks': tasks
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def register_polish_fonts():
    """Rejestruje polskie czcionki dla PDF"""
    try:
        font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        bold_font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
        if os.path.exists(bold_font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', bold_font_path))
        
        return 'DejaVuSans'
    except:
        return 'Helvetica'

POLISH_FONT = register_polish_fonts()

def truncate_text(text, max_length=20):
    """Skraca długi tekst do określonej długości"""
    if text is None:
        return ''
    text_str = str(text)
    if len(text_str) <= max_length:
        return text_str
    return text_str[:max_length-3] + '...'

def create_multi_part_pdf_table(data, headers, title):
    """Tworzy PDF z tabelą podzieloną na części"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), 
                          leftMargin=15, rightMargin=15, 
                          topMargin=20, bottomMargin=20)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=POLISH_FONT,
        fontSize=18,
        spaceAfter=25,
        alignment=1,
        textColor=colors.darkblue
    )
    
    # Style dla nagłówków sekcji
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName=POLISH_FONT,
        fontSize=14,
        spaceAfter=15,
        spaceBefore=20,
        alignment=0,
        textColor=colors.darkblue,
        borderWidth=1,
        borderColor=colors.darkblue,
        borderPadding=8
    )
    
    # Style dla tabeli
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName=POLISH_FONT,
        fontSize=9,
        textColor=colors.white,
        alignment=1,
        spaceAfter=6,
        spaceBefore=6
    )
    
    cell_style = ParagraphStyle(
        'CellStyle',
        parent=styles['Normal'],
        fontName=POLISH_FONT,
        fontSize=8,
        textColor=colors.black,
        alignment=0,
        spaceAfter=4,
        spaceBefore=4,
        leftIndent=6,
        rightIndent=6
    )
    
    elements = []
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 20))
    
    # Podziel kolumny na części
    num_cols = len(headers)
    if num_cols <= 12:
        # Podziel na 2 części
        mid_point = num_cols // 2
        part1_headers = headers[:mid_point]
        part2_headers = headers[mid_point:]
        
        # Część 1 - podstawowe informacje
        elements.append(Paragraph("📋 Podstawowe informacje", section_title_style))
        elements.append(create_single_table(data, part1_headers, range(len(part1_headers))))
        elements.append(Spacer(1, 20))
        
        # Część 2 - dodatkowe informacje  
        elements.append(Paragraph("📊 Szczegóły i dodatkowe dane", section_title_style))
        elements.append(create_single_table(data, part2_headers, range(len(part1_headers), len(headers))))
        
    else:
        # Podziel na 3 części
        part_size = num_cols // 3
        part1_headers = headers[:part_size]
        part2_headers = headers[part_size:part_size*2]
        part3_headers = headers[part_size*2:]
        
        # Część 1
        elements.append(Paragraph("📋 Podstawowe informacje", section_title_style))
        elements.append(create_single_table(data, part1_headers, range(part_size)))
        elements.append(Spacer(1, 20))
        
        # Część 2
        elements.append(Paragraph("📊 Szczegóły finansowe", section_title_style))
        elements.append(create_single_table(data, part2_headers, range(part_size, part_size*2)))
        elements.append(Spacer(1, 20))
        
        # Część 3
        elements.append(Paragraph("🏷️ Dodatkowe informacje", section_title_style))
        elements.append(create_single_table(data, part3_headers, range(part_size*2, len(headers))))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

def create_single_table(data, headers, column_indices):
    """Tworzy pojedynczą tabelę z określonymi kolumnami"""
    page_width = landscape(A4)[0] - 30
    num_cols = len(headers)
    
    # Oblicz szerokości kolumn
    col_widths = [page_width / num_cols] * num_cols
    
    # Style
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=getSampleStyleSheet()['Normal'],
        fontName=POLISH_FONT,
        fontSize=9,
        textColor=colors.white,
        alignment=1,
        spaceAfter=6,
        spaceBefore=6
    )
    
    cell_style = ParagraphStyle(
        'CellStyle',
        parent=getSampleStyleSheet()['Normal'],
        fontName=POLISH_FONT,
        fontSize=8,
        textColor=colors.black,
        alignment=0,
        spaceAfter=4,
        spaceBefore=4,
        leftIndent=6,
        rightIndent=6
    )
    
    # Przygotuj dane tabeli
    table_data = []
    
    # Nagłówki
    header_row = []
    for header in headers:
        header_row.append(Paragraph(header, header_style))
    table_data.append(header_row)
    
    # Dane
    for row in data:
        data_row = []
        for i, header in enumerate(headers):
            col_index = list(column_indices)[i] if i < len(column_indices) else i
            cell_text = str(row[col_index]) if col_index < len(row) and row[col_index] is not None else ''
            # Skróć długie teksty
            if len(cell_text) > 25:
                cell_text = cell_text[:22] + '...'
            data_row.append(Paragraph(cell_text, cell_style))
        table_data.append(data_row)
    
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Styl tabeli
    table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), POLISH_FONT),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), POLISH_FONT),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.darkblue),
    ]
    
    # Alternujące kolory wierszy
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table_style.append(('BACKGROUND', (0, i), (-1, i), colors.lightgrey))
    
    table.setStyle(TableStyle(table_style))
    return table

def create_pdf_table(data, headers, title):
    """Tworzy tabelę PDF z polskimi znakami - dzieli na części jeśli za dużo kolumn"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), 
                          leftMargin=15, rightMargin=15, 
                          topMargin=20, bottomMargin=20)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=POLISH_FONT,
        fontSize=18,
        spaceAfter=25,
        alignment=1,
        textColor=colors.darkblue
    )
    
    # Oblicz optymalne szerokości kolumn
    num_cols = len(headers)
    
    # Jeśli za dużo kolumn (więcej niż 8), podziel na części
    if num_cols > 8:
        return create_multi_part_pdf_table(data, headers, title)
    
    # Style dla nagłówków tabeli - dynamiczne rozmiary czcionek
    header_font_size = 10
    if num_cols >= 12:
        header_font_size = 4
    elif num_cols >= 10:
        header_font_size = 5
    elif num_cols >= 8:
        header_font_size = 6
    elif num_cols >= 6:
        header_font_size = 7

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName=POLISH_FONT,
        fontSize=header_font_size,
        textColor=colors.white,
        alignment=1,
        spaceAfter=3,
        spaceBefore=3
    )
    
    # Style dla danych w tabeli - dynamiczne rozmiary czcionek
    cell_font_size = 9
    if num_cols >= 12:
        cell_font_size = 4
    elif num_cols >= 10:
        cell_font_size = 5
    elif num_cols >= 8:
        cell_font_size = 6
    elif num_cols >= 6:
        cell_font_size = 7

    cell_style = ParagraphStyle(
        'CellStyle',
        parent=styles['Normal'],
        fontName=POLISH_FONT,
        fontSize=cell_font_size,
        textColor=colors.black,
        alignment=0,  # Left align
        spaceAfter=4,
        spaceBefore=4,
        leftIndent=6,
        rightIndent=6
    )
    
    # Style dla nagłówków sekcji
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName=POLISH_FONT,
        fontSize=11,
        textColor=colors.darkblue,
        alignment=0,  # Left align
        spaceAfter=8,
        spaceBefore=12,
        leftIndent=6,
        rightIndent=6,
        borderWidth=1,
        borderColor=colors.darkblue,
        borderPadding=4
    )
    
    elements = []
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 20))
    page_width = landscape(A4)[0] - 20  # Dostępna szerokość minus marginesy (10+10)
    
    # Inteligentne szerokości kolumn w zależności od liczby i typu kolumn
    if num_cols == 1:
        col_widths = [page_width * 0.9]
    elif num_cols == 2:
        col_widths = [page_width * 0.4, page_width * 0.5]
    elif num_cols == 3:
        col_widths = [page_width * 0.25, page_width * 0.35, page_width * 0.35]
    elif num_cols == 4:
        col_widths = [page_width * 0.2, page_width * 0.25, page_width * 0.25, page_width * 0.25]
    elif num_cols == 5:
        col_widths = [page_width * 0.15, page_width * 0.2, page_width * 0.2, page_width * 0.2, page_width * 0.2]
    elif num_cols == 6:
        col_widths = [page_width * 0.12, page_width * 0.16, page_width * 0.16, page_width * 0.16, page_width * 0.16, page_width * 0.2]
    elif num_cols == 7:
        col_widths = [page_width * 0.1, page_width * 0.13, page_width * 0.13, page_width * 0.13, page_width * 0.13, page_width * 0.13, page_width * 0.15]
    elif num_cols == 8:
        col_widths = [page_width * 0.08, page_width * 0.11, page_width * 0.11, page_width * 0.11, page_width * 0.11, page_width * 0.11, page_width * 0.11, page_width * 0.13]
    elif num_cols == 9:
        col_widths = [page_width * 0.07, page_width * 0.1, page_width * 0.1, page_width * 0.1, page_width * 0.1, page_width * 0.1, page_width * 0.1, page_width * 0.1, page_width * 0.12]
    elif num_cols == 10:
        # Specjalne szerokości dla raportu faktur (10 kolumn)
        col_widths = [page_width * 0.06, page_width * 0.08, page_width * 0.08, page_width * 0.08, page_width * 0.08, 
                     page_width * 0.06, page_width * 0.08, page_width * 0.08, page_width * 0.08, page_width * 0.08]
    elif num_cols == 11:
        col_widths = [page_width * 0.06, page_width * 0.07, page_width * 0.07, page_width * 0.07, page_width * 0.07, 
                     page_width * 0.07, page_width * 0.07, page_width * 0.07, page_width * 0.07, page_width * 0.07, page_width * 0.07]
    elif num_cols == 12:
        # Specjalne szerokości dla raportu faktur z tags i items (12 kolumn)
        col_widths = [page_width * 0.04, page_width * 0.06, page_width * 0.06, page_width * 0.06, page_width * 0.06, 
                     page_width * 0.04, page_width * 0.06, page_width * 0.06, page_width * 0.06, page_width * 0.06, 
                     page_width * 0.06, page_width * 0.06]
    else:
        # Dla więcej niż 12 kolumn - bardzo małe równe szerokości
        col_widths = [page_width / num_cols] * num_cols
    
    # Przygotuj dane tabeli z Paragraph objects dla lepszego formatowania
    table_data = []
    
    # Nagłówki
    header_row = []
    for header in headers:
        header_row.append(Paragraph(header, header_style))
    table_data.append(header_row)
    
    # Dane
    for row in data:
        data_row = []
        is_section_header = False
        
        for i, cell in enumerate(row):
            cell_text = str(cell) if cell is not None else ''
            
            # Sprawdź czy to nagłówek sekcji (zawiera duże litery i dwukropek lub jest w całości dużymi literami)
            if (cell_text.isupper() and len(cell_text) > 3) or cell_text.endswith(':'):
                is_section_header = True
                data_row.append(Paragraph(cell_text, section_header_style))
            else:
                # Skróć tekst w zależności od liczby kolumn
                if num_cols >= 10:
                    cell_text = truncate_text(cell_text, 15)
                elif num_cols >= 8:
                    cell_text = truncate_text(cell_text, 20)
                elif num_cols >= 6:
                    cell_text = truncate_text(cell_text, 25)
                
                data_row.append(Paragraph(cell_text, cell_style))
        
        table_data.append(data_row)
    
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Styl tabeli - podstawowy
    table_style = [
        # Nagłówek tabeli
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), POLISH_FONT),
        ('FONTSIZE', (0, 0), (-1, 0), header_font_size),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4 if num_cols >= 12 else 6),
        ('TOPPADDING', (0, 0), (-1, 0), 4 if num_cols >= 12 else 6),
        
        # Dane - domyślne style
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), POLISH_FONT),
        ('FONTSIZE', (0, 1), (-1, -1), cell_font_size),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 2 if num_cols >= 12 else 4),
        ('TOPPADDING', (0, 1), (-1, -1), 2 if num_cols >= 12 else 4),
        
        # Ramki
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.darkblue),
        
        # Wyrównanie dla pierwszej kolumny (ID)
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
    ]
    
    # Dodaj style dla nagłówków sekcji - znajdź wiersze z nagłówkami sekcji
    for row_idx, row in enumerate(table_data):
        if row_idx > 0:  # Pomijamy nagłówek tabeli
            first_cell_text = str(row[0])
            if first_cell_text.isupper() and len(first_cell_text) > 3:
                # To jest nagłówek sekcji - zastosuj specjalne style
                table_style.extend([
                    ('BACKGROUND', (0, row_idx), (-1, row_idx), colors.lightblue),
                    ('TEXTCOLOR', (0, row_idx), (-1, row_idx), colors.darkblue),
                    ('FONTNAME', (0, row_idx), (-1, row_idx), POLISH_FONT),
                    ('FONTSIZE', (0, row_idx), (-1, row_idx), max(cell_font_size, 7)),
                    ('BOTTOMPADDING', (0, row_idx), (-1, row_idx), 6),
                    ('TOPPADDING', (0, row_idx), (-1, row_idx), 6),
                    ('LINEBELOW', (0, row_idx), (-1, row_idx), 1, colors.darkblue),
                ])
    
    # Alternujące kolory wierszy - tylko dla wierszy danych (nie nagłówków sekcji)
    data_rows = []
    for row_idx, row in enumerate(table_data):
        if row_idx > 0:  # Pomijamy nagłówek tabeli
            first_cell_text = str(row[0])
            if not (first_cell_text.isupper() and len(first_cell_text) > 3):
                data_rows.append(row_idx)
    
    # Zastosuj alternujące kolory tylko do wierszy danych
    if len(data_rows) > 1:
        table_style.append(('ROWBACKGROUNDS', (0, data_rows[0]), (-1, data_rows[-1]), 
                           [colors.white, colors.lightgrey]))
    
    table.setStyle(TableStyle(table_style))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return buffer

@reports_bp.route('/groups/<int:group_id>/pdf', methods=['GET'])
@require_auth
def get_group_pdf_report(group_id):
    """Generuje szczegółowy raport PDF dla grupy z wszystkimi danymi"""
    try:
        # Pobierz dane grupy
        group_query = text("""
            SELECT g.Id, g.Name, g.Description
            FROM Groups g
            WHERE g.Id = :group_id
        """)
        
        group_result = db.session.execute(group_query, {'group_id': group_id})
        group_data = group_result.fetchone()
        
        if not group_data:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Pobierz użytkowników w grupie
        users_query = text("""
            SELECT u.Id, u.Username, u.Email
            FROM users u
            JOIN UserGroups ug ON u.Id = ug.UserId
            WHERE ug.GroupId = :group_id
        """)
        users_result = db.session.execute(users_query, {'group_id': group_id})
        users_data = users_result.fetchall()
        
        # Pobierz klientów w grupie
        customers_query = text("""
            SELECT c.Id, c.Name, c.Email, c.Phone, c.Company, c.Address
            FROM Customers c
            WHERE c.AssignedGroupId = :group_id
        """)
        customers_result = db.session.execute(customers_query, {'group_id': group_id})
        customers_data = customers_result.fetchall()
        
        # Pobierz faktury dla klientów w grupie
        invoices_query = text("""
            SELECT i.Id, i.Number, i.TotalAmount, i.IsPaid, i.IssuedAt, c.Name as CustomerName
            FROM Invoices i
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
            ORDER BY i.IssuedAt DESC
        """)
        invoices_result = db.session.execute(invoices_query, {'group_id': group_id})
        invoices_data = invoices_result.fetchall()
        
        # Pobierz zadania dla klientów w grupie
        tasks_query = text("""
            SELECT t.Id, t.Title, t.Description, t.Completed, t.DueDate, c.Name as CustomerName
            FROM Tasks t
            INNER JOIN Customers c ON t.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
            ORDER BY t.DueDate ASC
        """)
        tasks_result = db.session.execute(tasks_query, {'group_id': group_id})
        tasks_data = tasks_result.fetchall()
        
        # Pobierz płatności dla faktur w grupie
        payments_query = text("""
            SELECT p.Id, p.Amount, p.PaidAt, i.Number as InvoiceNumber, c.Name as CustomerName
            FROM Payments p
            INNER JOIN Invoices i ON p.InvoiceId = i.Id
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE c.AssignedGroupId = :group_id
            ORDER BY p.PaidAt DESC
        """)
        payments_result = db.session.execute(payments_query, {'group_id': group_id})
        payments_data = payments_result.fetchall()
        
        # Oblicz statystyki
        total_invoices = len(invoices_data)
        paid_invoices = sum(1 for inv in invoices_data if inv[3])  # IsPaid
        unpaid_invoices = total_invoices - paid_invoices
        total_invoice_value = sum(float(inv[2]) for inv in invoices_data if inv[2])
        paid_value = sum(float(inv[2]) for inv in invoices_data if inv[2] and inv[3])
        unpaid_value = total_invoice_value - paid_value
        
        total_tasks = len(tasks_data)
        completed_tasks = sum(1 for task in tasks_data if task[3])  # Completed
        pending_tasks = total_tasks - completed_tasks
        
        total_payments = len(payments_data)
        total_paid_amount = sum(float(p[1]) for p in payments_data if p[1])
        
        # Przygotuj szczegółowe dane dla PDF - struktura z nagłówkami sekcji
        data = []
        
        # Statystyki ogólne - pierwsza sekcja
        data.extend([
            ["STATYSTYKI OGÓLNE", "", ""],
            [f"Liczba członków grupy:", f"{len(users_data)}", ""],
            [f"Liczba klientów:", f"{len(customers_data)}", ""],
            [f"Liczba faktur:", f"{total_invoices}", ""],
            [f"  - Opłacone:", f"{paid_invoices}", ""],
            [f"  - Nieopłacone:", f"{unpaid_invoices}", ""],
            [f"Wartość wszystkich faktur:", f"{total_invoice_value:.2f} PLN", ""],
            [f"  - Opłacone:", f"{paid_value:.2f} PLN", ""],
            [f"  - Nieopłacone:", f"{unpaid_value:.2f} PLN", ""],
            [f"Liczba zadań:", f"{total_tasks}", ""],
            [f"  - Ukończone:", f"{completed_tasks}", ""],
            [f"  - W trakcie:", f"{pending_tasks}", ""],
            [f"Liczba płatności:", f"{total_payments}", ""],
            [f"Łączna kwota płatności:", f"{total_paid_amount:.2f} PLN", ""]
        ])
        
        # Członkowie grupy
        if users_data:
            data.extend([
                ["CZŁONKOWIE GRUPY", "", ""]
            ])
            for user in users_data:
                data.append([f"ID: {user[0]}", f"Użytkownik: {user[1]}", f"Email: {user[2]}"])
        else:
            data.append(["CZŁONKOWIE GRUPY", "Brak członków", ""])
        
        # Klienci
        if customers_data:
            data.extend([
                ["KLIENCI W GRUPIE", "", ""]
            ])
            for customer in customers_data:
                company_info = f" ({customer[4]})" if customer[4] else ""
                phone_info = f" | Tel: {customer[3]}" if customer[3] else ""
                data.append([
                    f"ID: {customer[0]}", 
                    f"{customer[1]}{company_info}", 
                    f"Email: {customer[2]}{phone_info}"
                ])
        else:
            data.append(["KLIENCI W GRUPIE", "Brak klientów", ""])
        
        # Faktury
        if invoices_data:
            data.extend([
                ["FAKTURY", "", ""]
            ])
            for invoice in invoices_data:
                status = "OPŁACONA" if invoice[3] else "NIEOFŁACONA"
                date_str = invoice[4].strftime('%d.%m.%Y') if invoice[4] else 'Brak daty'
                data.append([
                    f"ID: {invoice[0]}", 
                    f"{invoice[1]} - {invoice[5]}", 
                    f"{float(invoice[2]):.2f} PLN | {status} | {date_str}"
                ])
        else:
            data.append(["FAKTURY", "Brak faktur", ""])
        
        # Zadania
        if tasks_data:
            data.extend([
                ["ZADANIA", "", ""]
            ])
            for task in tasks_data:
                status = "UKOŃCZONE" if task[3] else "W TRAKCIE"
                due_date = task[4].strftime('%d.%m.%Y') if task[4] else 'Brak terminu'
                data.append([
                    f"ID: {task[0]}", 
                    f"{task[1]} - {task[5]}", 
                    f"{status} | Termin: {due_date}"
                ])
        else:
            data.append(["ZADANIA", "Brak zadań", ""])
        
        # Płatności
        if payments_data:
            data.extend([
                ["PŁATNOŚCI", "", ""]
            ])
            for payment in payments_data:
                date_str = payment[2].strftime('%d.%m.%Y %H:%M') if payment[2] else 'Brak daty'
                data.append([
                    f"ID: {payment[0]}", 
                    f"{payment[3]} - {payment[4]}", 
                    f"{float(payment[1]):.2f} PLN | {date_str}"
                ])
        else:
            data.append(["PŁATNOŚCI", "Brak płatności", ""])
        
        headers = ["Kategoria", "Wartość", "Dodatkowe informacje"]
        
        # Dodaj informacje o raporcie w tytule
        report_title = f"Raport grupy: {group_data[1]}"
        if group_data[2]:
            report_title += f" - {group_data[2]}"
        report_title += f" (wygenerowano: {datetime.now().strftime('%d.%m.%Y %H:%M')})"
        
        buffer = create_pdf_table(data, headers, report_title)
        
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        # Usuń polskie znaki z nazwy pliku
        safe_group_name = group_data[1].replace('ą', 'a').replace('ć', 'c').replace('ę', 'e').replace('ł', 'l').replace('ń', 'n').replace('ó', 'o').replace('ś', 's').replace('ź', 'z').replace('ż', 'z')
        response.headers['Content-Disposition'] = f'attachment; filename=raport_grupy_{group_id}_{safe_group_name}.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpointy dla raportów tagów
@reports_bp.route('/tags/<int:tag_id>/customers', methods=['GET'])
@require_auth
def get_tag_customers(tag_id):
    """Pobiera klientów przypisanych do tagu"""
    try:
        query = text("""
            SELECT DISTINCT c.Id, c.Name, c.Email, c.Phone, c.Company, c.Address
            FROM Customers c
            INNER JOIN CustomerTags ct ON c.Id = ct.CustomerId
            WHERE ct.TagId = :tag_id
            ORDER BY c.Name
        """)
        result = db.session.execute(query, {'tag_id': tag_id})
        customers = result.fetchall()
        
        customers_data = []
        for customer in customers:
            customers_data.append({
                'id': customer[0],
                'name': customer[1],
                'email': customer[2],
                'phone': customer[3],
                'company': customer[4],
                'address': customer[5]
            })
        
        return jsonify(customers_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/tags/<int:tag_id>/invoices', methods=['GET'])
@require_auth
def get_tag_invoices(tag_id):
    """Pobiera faktury przypisane do tagu"""
    try:
        query = text("""
            SELECT DISTINCT i.Id, i.Number, i.TotalAmount, i.IsPaid, i.IssuedAt, c.Name as CustomerName
            FROM Invoices i
            INNER JOIN InvoiceTags it ON i.Id = it.InvoiceId
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE it.TagId = :tag_id
            ORDER BY i.IssuedAt DESC
        """)
        result = db.session.execute(query, {'tag_id': tag_id})
        invoices = result.fetchall()
        
        invoices_data = []
        for invoice in invoices:
            invoices_data.append({
                'id': invoice[0],
                'number': invoice[1],
                'totalAmount': float(invoice[2]) if invoice[2] else 0,
                'isPaid': bool(invoice[3]),
                'issuedAt': invoice[4].isoformat() if invoice[4] else None,
                'customerName': invoice[5]
            })
        
        return jsonify(invoices_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/tags/<int:tag_id>/tasks', methods=['GET'])
@require_auth
def get_tag_tasks(tag_id):
    """Pobiera zadania przypisane do tagu"""
    try:
        query = text("""
            SELECT DISTINCT t.Id, t.Title, t.Description, t.Completed, t.DueDate, c.Name as CustomerName
            FROM Tasks t
            INNER JOIN TaskTags tt ON t.Id = tt.TaskId
            INNER JOIN Customers c ON t.CustomerId = c.Id
            WHERE tt.TagId = :tag_id
            ORDER BY t.DueDate DESC
        """)
        result = db.session.execute(query, {'tag_id': tag_id})
        tasks = result.fetchall()
        
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': task[0],
                'title': task[1],
                'description': task[2],
                'completed': bool(task[3]),
                'dueDate': task[4].isoformat() if task[4] else None,
                'customerName': task[5]
            })
        
        return jsonify(tasks_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/tags/<int:tag_id>/contracts', methods=['GET'])
@require_auth
def get_tag_contracts(tag_id):
    """Pobiera kontrakty przypisane do tagu"""
    try:
        query = text("""
            SELECT DISTINCT c.Id, c.Title, c.StartDate, c.EndDate, c.NetAmount, cust.Name as CustomerName
            FROM Contracts c
            INNER JOIN ContractTags ct ON c.Id = ct.ContractId
            INNER JOIN Customers cust ON c.CustomerId = cust.Id
            WHERE ct.TagId = :tag_id
            ORDER BY c.StartDate DESC
        """)
        result = db.session.execute(query, {'tag_id': tag_id})
        contracts = result.fetchall()
        
        contracts_data = []
        for contract in contracts:
            contracts_data.append({
                'id': contract[0],
                'title': contract[1],
                'startDate': contract[2].isoformat() if contract[2] else None,
                'endDate': contract[3].isoformat() if contract[3] else None,
                'value': float(contract[4]) if contract[4] else 0,
                'customerName': contract[5]
            })
        
        return jsonify(contracts_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/tags/<int:tag_id>/meetings', methods=['GET'])
@require_auth
def get_tag_meetings(tag_id):
    """Pobiera spotkania przypisane do tagu"""
    try:
        query = text("""
            SELECT DISTINCT m.Id, m.Topic, m.ScheduledAt, c.Name as CustomerName
            FROM Meetings m
            INNER JOIN MeetingTags mt ON m.Id = mt.MeetingId
            INNER JOIN Customers c ON m.CustomerId = c.Id
            WHERE mt.TagId = :tag_id
            ORDER BY m.ScheduledAt DESC
        """)
        result = db.session.execute(query, {'tag_id': tag_id})
        meetings = result.fetchall()
        
        meetings_data = []
        for meeting in meetings:
            meetings_data.append({
                'id': meeting[0],
                'title': meeting[1],
                'description': meeting[1],  # Użyj Topic jako description
                'startTime': meeting[2].isoformat() if meeting[2] else None,
                'endTime': None,  # Brak kolumny EndTime
                'location': None,  # Brak kolumny Location
                'customerName': meeting[3]
            })
        
        return jsonify(meetings_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/tags/<int:tag_id>/pdf', methods=['GET'])
@require_auth
def get_tag_pdf_report(tag_id):
    """Generuje szczegółowy raport PDF dla tagu z wszystkimi danymi"""
    try:
        # Pobierz dane tagu
        tag_query = text("""
            SELECT t.Id, t.Name, t.Description, t.Color
            FROM Tags t
            WHERE t.Id = :tag_id
        """)
        tag_result = db.session.execute(tag_query, {'tag_id': tag_id})
        tag_data = tag_result.fetchone()
        
        if not tag_data:
            return jsonify({'error': 'Tag nie znaleziony'}), 404
        
        # Pobierz klientów przypisanych do tagu
        customers_query = text("""
            SELECT DISTINCT c.Id, c.Name, c.Email, c.Phone, c.Company, c.Address
            FROM Customers c
            INNER JOIN CustomerTags ct ON c.Id = ct.CustomerId
            WHERE ct.TagId = :tag_id
            ORDER BY c.Name
        """)
        customers_result = db.session.execute(customers_query, {'tag_id': tag_id})
        customers_data = customers_result.fetchall()
        
        # Pobierz faktury przypisane do tagu
        invoices_query = text("""
            SELECT DISTINCT i.Id, i.Number, i.TotalAmount, i.IsPaid, i.IssuedAt, c.Name as CustomerName
            FROM Invoices i
            INNER JOIN InvoiceTags it ON i.Id = it.InvoiceId
            INNER JOIN Customers c ON i.CustomerId = c.Id
            WHERE it.TagId = :tag_id
            ORDER BY i.IssuedAt DESC
        """)
        invoices_result = db.session.execute(invoices_query, {'tag_id': tag_id})
        invoices_data = invoices_result.fetchall()
        
        # Pobierz zadania przypisane do tagu
        tasks_query = text("""
            SELECT DISTINCT t.Id, t.Title, t.Description, t.Completed, t.DueDate, c.Name as CustomerName
            FROM Tasks t
            INNER JOIN TaskTags tt ON t.Id = tt.TaskId
            INNER JOIN Customers c ON t.CustomerId = c.Id
            WHERE tt.TagId = :tag_id
            ORDER BY t.DueDate DESC
        """)
        tasks_result = db.session.execute(tasks_query, {'tag_id': tag_id})
        tasks_data = tasks_result.fetchall()
        
        # Pobierz kontrakty przypisane do tagu
        contracts_query = text("""
            SELECT DISTINCT c.Id, c.Title, c.StartDate, c.EndDate, c.NetAmount, cust.Name as CustomerName
            FROM Contracts c
            INNER JOIN ContractTags ct ON c.Id = ct.ContractId
            INNER JOIN Customers cust ON c.CustomerId = cust.Id
            WHERE ct.TagId = :tag_id
            ORDER BY c.StartDate DESC
        """)
        contracts_result = db.session.execute(contracts_query, {'tag_id': tag_id})
        contracts_data = contracts_result.fetchall()
        
        # Pobierz spotkania przypisane do tagu
        meetings_query = text("""
            SELECT DISTINCT m.Id, m.Topic, m.ScheduledAt, c.Name as CustomerName
            FROM Meetings m
            INNER JOIN MeetingTags mt ON m.Id = mt.MeetingId
            INNER JOIN Customers c ON m.CustomerId = c.Id
            WHERE mt.TagId = :tag_id
            ORDER BY m.ScheduledAt DESC
        """)
        meetings_result = db.session.execute(meetings_query, {'tag_id': tag_id})
        meetings_data = meetings_result.fetchall()
        
        # Oblicz statystyki
        total_invoices = len(invoices_data)
        paid_invoices = sum(1 for inv in invoices_data if inv[3])  # IsPaid
        unpaid_invoices = total_invoices - paid_invoices
        total_invoice_value = sum(float(inv[2]) for inv in invoices_data if inv[2])
        paid_value = sum(float(inv[2]) for inv in invoices_data if inv[2] and inv[3])
        unpaid_value = total_invoice_value - paid_value
        
        total_tasks = len(tasks_data)
        completed_tasks = sum(1 for task in tasks_data if task[3])  # Completed
        pending_tasks = total_tasks - completed_tasks
        
        total_contracts = len(contracts_data)
        total_contract_value = sum(float(c[4]) for c in contracts_data if c[4])
        
        total_meetings = len(meetings_data)
        
        # Przygotuj szczegółowe dane dla PDF - struktura z nagłówkami sekcji
        data = []
        
        # Statystyki ogólne - pierwsza sekcja
        data.extend([
            ["STATYSTYKI OGÓLNE", "", ""],
            [f"Liczba klientów:", f"{len(customers_data)}", ""],
            [f"Liczba faktur:", f"{total_invoices}", ""],
            [f"  - Opłacone:", f"{paid_invoices}", ""],
            [f"  - Nieopłacone:", f"{unpaid_invoices}", ""],
            [f"Wartość wszystkich faktur:", f"{total_invoice_value:.2f} PLN", ""],
            [f"  - Opłacone:", f"{paid_value:.2f} PLN", ""],
            [f"  - Nieopłacone:", f"{unpaid_value:.2f} PLN", ""],
            [f"Liczba zadań:", f"{total_tasks}", ""],
            [f"  - Ukończone:", f"{completed_tasks}", ""],
            [f"  - W trakcie:", f"{pending_tasks}", ""],
            [f"Liczba kontraktów:", f"{total_contracts}", ""],
            [f"Wartość kontraktów:", f"{total_contract_value:.2f} PLN", ""],
            [f"Liczba spotkań:", f"{total_meetings}", ""]
        ])
        
        # Klienci
        if customers_data:
            data.extend([
                ["KLIENCI Z TAGIEM", "", ""]
            ])
            for customer in customers_data:
                company_info = f" ({customer[4]})" if customer[4] else ""
                phone_info = f" | Tel: {customer[3]}" if customer[3] else ""
                data.append([
                    f"ID: {customer[0]}", 
                    f"{customer[1]}{company_info}", 
                    f"Email: {customer[2]}{phone_info}"
                ])
        else:
            data.append(["KLIENCI Z TAGIEM", "Brak klientów", ""])
        
        # Faktury
        if invoices_data:
            data.extend([
                ["FAKTURY Z TAGIEM", "", ""]
            ])
            for invoice in invoices_data:
                status = "OPŁACONA" if invoice[3] else "NIEOFŁACONA"
                date_str = invoice[4].strftime('%d.%m.%Y') if invoice[4] else 'Brak daty'
                data.append([
                    f"ID: {invoice[0]}", 
                    f"{invoice[1]} - {invoice[5]}", 
                    f"{float(invoice[2]):.2f} PLN | {status} | {date_str}"
                ])
        else:
            data.append(["FAKTURY Z TAGIEM", "Brak faktur", ""])
        
        # Zadania
        if tasks_data:
            data.extend([
                ["ZADANIA Z TAGIEM", "", ""]
            ])
            for task in tasks_data:
                status = "UKOŃCZONE" if task[3] else "W TRAKCIE"
                due_date = task[4].strftime('%d.%m.%Y') if task[4] else 'Brak terminu'
                data.append([
                    f"ID: {task[0]}", 
                    f"{task[1]} - {task[5]}", 
                    f"{status} | Termin: {due_date}"
                ])
        else:
            data.append(["ZADANIA Z TAGIEM", "Brak zadań", ""])
        
        # Kontrakty
        if contracts_data:
            data.extend([
                ["KONTRAKTY Z TAGIEM", "", ""]
            ])
            for contract in contracts_data:
                start_date = contract[2].strftime('%d.%m.%Y') if contract[2] else 'Brak daty'
                end_date = contract[3].strftime('%d.%m.%Y') if contract[3] else 'Brak daty'
                data.append([
                    f"ID: {contract[0]}", 
                    f"{contract[1]} - {contract[5]}", 
                    f"{float(contract[4]):.2f} PLN | {start_date} - {end_date}"
                ])
        else:
            data.append(["KONTRAKTY Z TAGIEM", "Brak kontraktów", ""])
        
        # Spotkania
        if meetings_data:
            data.extend([
                ["SPOTKANIA Z TAGIEM", "", ""]
            ])
            for meeting in meetings_data:
                start_time = meeting[2].strftime('%d.%m.%Y %H:%M') if meeting[2] else 'Brak daty'
                data.append([
                    f"ID: {meeting[0]}", 
                    f"{meeting[1]} - {meeting[3]}", 
                    f"{start_time}"
                ])
        else:
            data.append(["SPOTKANIA Z TAGIEM", "Brak spotkań", ""])
        
        headers = ["Kategoria", "Wartość", "Dodatkowe informacje"]
        
        # Dodaj informacje o raporcie w tytule
        report_title = f"Raport tagu: {tag_data[1]}"
        if tag_data[2]:
            report_title += f" - {tag_data[2]}"
        report_title += f" (wygenerowano: {datetime.now().strftime('%d.%m.%Y %H:%M')})"
        
        buffer = create_pdf_table(data, headers, report_title)
        
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        # Usuń polskie znaki z nazwy pliku
        safe_tag_name = tag_data[1].replace('ą', 'a').replace('ć', 'c').replace('ę', 'e').replace('ł', 'l').replace('ń', 'n').replace('ó', 'o').replace('ś', 's').replace('ź', 'z').replace('ż', 'z')
        response.headers['Content-Disposition'] = f'attachment; filename=raport_tagu_{tag_id}_{safe_tag_name}.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/export-meetings', methods=['GET'])
@require_auth
def export_meetings():
    """Eksportuje spotkania do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'topic', 'customerName', 'scheduledAt']
        
        # Pobierz dane
        query = text("""
            SELECT m.Id, m.Topic, c.Name as CustomerName, m.ScheduledAt
            FROM Meetings m
            LEFT JOIN Customers c ON m.CustomerId = c.Id
            ORDER BY m.ScheduledAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'topic':
                headers.append('Temat')
            elif col == 'scheduledAt':
                headers.append('Data spotkania')
            elif col == 'customerId':
                headers.append('ID klienta')
            elif col == 'customerName':
                headers.append('Nazwa klienta')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=spotkania.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Spotkania')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=spotkania.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                # Format scheduledAt (index 2)
                if len(pdf_row) > 2 and pdf_row[2] is not None and hasattr(pdf_row[2], 'strftime'):
                    pdf_row[2] = pdf_row[2].strftime('%d.%m.%Y %H:%M')
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport spotkań")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=spotkania.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/export-tasks', methods=['GET'])
@require_auth
def export_tasks():
    """Eksportuje zadania do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'title', 'description', 'status', 'createdAt']
        
        # Pobierz dane
        query = text("""
            SELECT t.Id, t.Title, t.Description, t.Status, t.CreatedAt
            FROM Tasks t
            ORDER BY t.CreatedAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'title':
                headers.append('Tytuł')
            elif col == 'description':
                headers.append('Opis')
            elif col == 'status':
                headers.append('Status')
            elif col == 'createdAt':
                headers.append('Data utworzenia')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=zadania.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Zadania')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=zadania.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                # Format createdAt (index 4)
                if len(pdf_row) > 4 and pdf_row[4] is not None and hasattr(pdf_row[4], 'strftime'):
                    pdf_row[4] = pdf_row[4].strftime('%d.%m.%Y %H:%M')
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport zadań")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=zadania.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/export-notes', methods=['GET'])
@require_auth
def export_notes():
    """Eksportuje notatki do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'title', 'content', 'createdAt', 'createdBy']
        
        # Pobierz dane
        query = text("""
            SELECT n.Id, n.Title, n.Content, n.CreatedAt, u.username as CreatedBy
            FROM Notes n
            LEFT JOIN users u ON n.CreatedByUserId = u.id
            ORDER BY n.CreatedAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'title':
                headers.append('Tytuł')
            elif col == 'content':
                headers.append('Treść')
            elif col == 'createdAt':
                headers.append('Data utworzenia')
            elif col == 'createdBy':
                headers.append('Utworzony przez')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=notatki.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Notatki')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=notatki.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                # Format createdAt (index 3)
                if len(pdf_row) > 3 and pdf_row[3] is not None and hasattr(pdf_row[3], 'strftime'):
                    pdf_row[3] = pdf_row[3].strftime('%d.%m.%Y %H:%M')
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport notatek")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=notatki.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/export-customers', methods=['GET'])
@require_auth
def export_customers():
    """Eksportuje klientów do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'name', 'email', 'phone', 'company', 'address', 'tags']
        
        # Buduj zapytanie SQL
        select_fields = []
        need_rep_join = False
        for col in columns:
            if col == 'id':
                select_fields.append('c.Id')
            elif col == 'name':
                select_fields.append('c.Name')
            elif col == 'email':
                select_fields.append('c.Email')
            elif col == 'phone':
                select_fields.append('c.Phone')
            elif col == 'company':
                select_fields.append('c.Company')
            elif col == 'address':
                select_fields.append('c.Address')
            elif col == 'nip':
                select_fields.append('c.NIP')
            elif col == 'representative':
              
                select_fields.append('CASE WHEN u_rep.id IS NOT NULL THEN CONCAT(u_rep.username, " (", u_rep.email, ")") ELSE NULL END as representative')
                need_rep_join = True
            elif col == 'createdAt':
                select_fields.append('c.CreatedAt')
            elif col == 'assignedGroup' and include_relations:
                select_fields.append('g.name as AssignedGroup')
            elif col == 'assignedUser' and include_relations:
                select_fields.append('u.username as AssignedUser')
            elif col == 'tags':
                select_fields.append('(SELECT GROUP_CONCAT(t.Name SEPARATOR \', \') FROM Tags t JOIN CustomerTags ct ON t.Id = ct.TagId WHERE ct.CustomerId = c.Id) as tags')
        
        if not select_fields:
            select_fields = ['c.Id', 'c.Name', 'c.Email', 'c.Phone', 'c.Company', 'c.Address']
        
        query_sql = f"""
            SELECT {', '.join(select_fields)}
            FROM Customers c
        """
        
        if include_relations:
            query_sql += """
                LEFT JOIN `Groups` g ON c.AssignedGroupId = g.Id
                LEFT JOIN users u ON c.AssignedUserId = u.id
            """
        
        # Dodaj JOIN dla representative jeśli potrzebny
        if need_rep_join:
            query_sql += """
                LEFT JOIN users u_rep ON c.RepresentativeUserId = u_rep.id
            """
        
        query_sql += " ORDER BY c.Id"
        
        query = text(query_sql)
        result = db.session.execute(query)
        data = result.fetchall()
        
        # Mapuj nagłówki
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'name':
                headers.append('Nazwa')
            elif col == 'email':
                headers.append('Email')
            elif col == 'phone':
                headers.append('Telefon')
            elif col == 'company':
                headers.append('Firma')
            elif col == 'address':
                headers.append('Adres')
            elif col == 'nip':
                headers.append('NIP')
            elif col == 'representative':
                headers.append('Przedstawiciel')
            elif col == 'createdAt':
                headers.append('Data utworzenia')
            elif col == 'assignedGroup':
                headers.append('Przypisana grupa')
            elif col == 'assignedUser':
                headers.append('Przypisany użytkownik')
            elif col == 'tags':
                headers.append('Tagi')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                try:
                    writer.writerow(row)
                except Exception as e:
                    print(f"Error writing row to CSV: {row}, Error: {e}")
                    raise # Re-raise the exception to get the full traceback
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=klienci.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Klienci')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=klienci.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []

            # Find indexes of columns to format
            try:
                total_invoice_value_index = columns.index('totalInvoiceValue')
            except ValueError:
                total_invoice_value_index = -1
            
            try:
                paid_invoice_value_index = columns.index('paidInvoiceValue')
            except ValueError:
                paid_invoice_value_index = -1

            try:
                created_at_index = columns.index('createdAt')
            except ValueError:
                created_at_index = -1

            for row in data:
                # Konwertuj Row object z SQLAlchemy na listę w kolejności odpowiadającej columns
                pdf_row = []
                try:
                    # Tworzymy mapowanie nazw kolumn do wartości
                    row_dict = {}
                    if hasattr(row, '_mapping'):
                        # SQLAlchemy Row object z 1.4+
                        row_dict = dict(row._mapping)
                    elif hasattr(row, 'keys'):
                        # SQLAlchemy Row object z keys()
                        row_dict = {key: row[key] for key in row.keys()}
                    elif hasattr(row, '__iter__') and not isinstance(row, str):
                        # Tuple lub lista - używamy nazw kolumn z select_fields
                        row_values = list(row)
                        for i, field in enumerate(select_fields):
                            # Wyciągnij alias z pola (np. "as representative" -> "representative")
                            if ' as ' in field.lower():
                                alias = field.split(' as ')[-1].strip()
                            elif ' AS ' in field:
                                alias = field.split(' AS ')[-1].strip()
                            else:
                                # Jeśli nie ma aliasu, użyj ostatniej części po kropce
                                alias = field.split('.')[-1].strip()
                            if i < len(row_values):
                                row_dict[alias] = row_values[i]
                    else:
                        row_dict = {}
                    
                    # Mapuj wartości w kolejności odpowiadającej columns
                    for col in columns:
                        # Mapuj nazwę kolumny na alias w SQL
                        sql_alias = col
                        if col == 'id':
                            sql_alias = 'Id'
                        elif col == 'name':
                            sql_alias = 'Name'
                        elif col == 'email':
                            sql_alias = 'Email'
                        elif col == 'phone':
                            sql_alias = 'Phone'
                        elif col == 'company':
                            sql_alias = 'Company'
                        elif col == 'address':
                            sql_alias = 'Address'
                        elif col == 'nip':
                            sql_alias = 'NIP'
                        elif col == 'representative':
                            sql_alias = 'representative'
                        elif col == 'tags':
                            sql_alias = 'tags'
                        elif col == 'createdAt':
                            sql_alias = 'CreatedAt'
                        elif col == 'assignedGroup':
                            sql_alias = 'AssignedGroup'
                        elif col == 'assignedUser':
                            sql_alias = 'AssignedUser'
                        
                        value = row_dict.get(sql_alias, None)
                        # Jeśli wartość jest None lub pustym stringiem dla representative, ustaw pusty string
                        if col == 'representative' and (value is None or value == ' ()' or value == '()'):
                            value = ''
                        pdf_row.append(value)
                except (TypeError, AttributeError, IndexError, KeyError) as e:
                    # Fallback - użyj pozycji
                    try:
                        row_values = list(row) if hasattr(row, '__iter__') and not isinstance(row, str) else []
                        for i, col in enumerate(columns):
                            if i < len(row_values):
                                pdf_row.append(row_values[i])
                            else:
                                pdf_row.append(None)
                    except Exception:
                        pdf_row = []
                # Format totalInvoiceValue
                if total_invoice_value_index != -1 and len(pdf_row) > total_invoice_value_index and pdf_row[total_invoice_value_index] is not None:
                    try:
                        pdf_row[total_invoice_value_index] = f"{float(pdf_row[total_invoice_value_index]):.2f} PLN"
                    except (ValueError, TypeError):
                        pdf_row[total_invoice_value_index] = str(pdf_row[total_invoice_value_index])
                
                # Format paidInvoiceValue
                if paid_invoice_value_index != -1 and len(pdf_row) > paid_invoice_value_index and pdf_row[paid_invoice_value_index] is not None:
                    try:
                        pdf_row[paid_invoice_value_index] = f"{float(pdf_row[paid_invoice_value_index]):.2f} PLN"
                    except (ValueError, TypeError):
                        pdf_row[paid_invoice_value_index] = str(pdf_row[paid_invoice_value_index])

                # Format createdAt
                if created_at_index != -1 and len(pdf_row) > created_at_index and pdf_row[created_at_index] is not None and hasattr(pdf_row[created_at_index], 'strftime'):
                    pdf_row[created_at_index] = pdf_row[created_at_index].strftime('%d.%m.%Y')

                pdf_data.append(pdf_row)

            print(f"DEBUG: Headers before create_pdf_table: {headers}")
            buffer = create_pdf_table(pdf_data, headers, "Raport klientów")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=klienci.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Błąd eksportu: {str(e)}'}), 500

@reports_bp.route('/export-invoices', methods=['GET'])
@require_auth
def export_invoices():
    """Eksportuje faktury do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'number', 'customerName', 'customerEmail', 'totalAmount', 'isPaid', 'issuedAt', 'dueDate', 'assignedGroup', 'createdBy']
        
        # Pobierz dane - dynamiczne zapytanie w zależności od kolumn
        select_fields = []
        for col in columns:
            if col == 'id':
                select_fields.append('i.Id')
            elif col == 'number':
                select_fields.append('i.Number')
            elif col == 'customerName':
                select_fields.append('c.Name as CustomerName')
            elif col == 'customerEmail':
                select_fields.append('c.Email as customerEmail')
            elif col == 'totalAmount':
                select_fields.append('i.TotalAmount')
            elif col == 'isPaid':
                select_fields.append('i.IsPaid')
            elif col == 'issuedAt':
                select_fields.append('i.IssuedAt')
            elif col == 'dueDate':
                select_fields.append('i.DueDate')
            elif col == 'assignedGroup':
                select_fields.append('g.Name as assignedGroup')
            elif col == 'createdBy':
                select_fields.append('u.username as createdBy')
            elif col == 'tags':
                select_fields.append('(SELECT GROUP_CONCAT(t.Name SEPARATOR \', \') FROM Tags t JOIN CustomerTags ct ON t.Id = ct.TagId WHERE ct.CustomerId = c.Id) as tags')
            elif col == 'items':
                select_fields.append('(SELECT GROUP_CONCAT(ii.Description SEPARATOR \', \') FROM InvoiceItems ii WHERE ii.InvoiceId = i.Id) as items')
        
        if not select_fields:
            select_fields = ['i.Id', 'i.Number', 'c.Name as CustomerName', 'c.Email as customerEmail', 'i.TotalAmount', 'i.IsPaid', 'i.IssuedAt', 'i.DueDate', 'g.Name as assignedGroup', 'u.username as createdBy']
        
        query = text(f"""
            SELECT {', '.join(select_fields)}
            FROM Invoices i
            LEFT JOIN Customers c ON i.CustomerId = c.Id
            LEFT JOIN `Groups` g ON c.AssignedGroupId = g.Id
            LEFT JOIN users u ON i.CreatedByUserId = u.id
            ORDER BY i.IssuedAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'number':
                headers.append('Numer faktury')
            elif col == 'customerName':
                headers.append('Klient')
            elif col == 'customerEmail':
                headers.append('Email klienta')
            elif col == 'totalAmount':
                headers.append('Kwota')
            elif col == 'isPaid':
                headers.append('Opłacona')
            elif col == 'issuedAt':
                headers.append('Data wystawienia')
            elif col == 'dueDate':
                headers.append('Termin płatności')
            elif col == 'assignedGroup':
                headers.append('Grupa')
            elif col == 'createdBy':
                headers.append('Wystawiona przez')
            elif col == 'tags':
                headers.append('Tagi')
            elif col == 'items':
                headers.append('Przedmioty')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=faktury.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Faktury')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=faktury.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                # Format totalAmount (index 4)
                if len(pdf_row) > 4 and pdf_row[4] is not None:
                    try:
                        pdf_row[4] = f"{float(pdf_row[4]):.2f} PLN"
                    except (ValueError, TypeError):
                        pdf_row[4] = str(pdf_row[4])
                # Format isPaid (index 5)
                if len(pdf_row) > 5 and pdf_row[5] is not None:
                    pdf_row[5] = "Tak" if pdf_row[5] else "Nie"
                # Format issuedAt (index 6)
                if len(pdf_row) > 6 and pdf_row[6] is not None and hasattr(pdf_row[6], 'strftime'):
                    pdf_row[6] = pdf_row[6].strftime('%d.%m.%Y')
                # Format dueDate (index 7)
                if len(pdf_row) > 7 and pdf_row[7] is not None and hasattr(pdf_row[7], 'strftime'):
                    pdf_row[7] = pdf_row[7].strftime('%d.%m.%Y')
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport faktur")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=faktury.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Błąd eksportu: {str(e)}'}), 500

@reports_bp.route('/export-payments', methods=['GET'])
@require_auth
def export_payments():
    """Eksportuje płatności do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'invoiceNumber', 'customerName', 'amount', 'paidAt']
        
        # Pobierz dane
        query = text("""
            SELECT p.Id, i.Number as InvoiceNumber, c.Name as CustomerName, p.Amount, p.PaidAt
            FROM Payments p
            LEFT JOIN Invoices i ON p.InvoiceId = i.Id
            LEFT JOIN Customers c ON i.CustomerId = c.Id
            ORDER BY p.PaidAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'invoiceNumber':
                headers.append('Numer faktury')
            elif col == 'customerName':
                headers.append('Klient')
            elif col == 'amount':
                headers.append('Kwota')
            elif col == 'paidAt':
                headers.append('Data płatności')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=platnosci.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Płatności')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=platnosci.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                # Format amount (index 3)
                if len(pdf_row) > 3 and pdf_row[3] is not None:
                    try:
                        pdf_row[3] = f"{float(pdf_row[3]):.2f} PLN"
                    except (ValueError, TypeError):
                        pdf_row[3] = str(pdf_row[3]) # Keep original if conversion fails
                # Format paidAt (index 4)
                if len(pdf_row) > 4 and pdf_row[4] is not None and hasattr(pdf_row[4], 'strftime'):
                    pdf_row[4] = pdf_row[4].strftime('%d.%m.%Y %H:%M')
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport płatności")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=platnosci.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Błąd eksportu: {str(e)}'}), 500

@reports_bp.route('/export-contracts', methods=['GET'])
@require_auth
def export_contracts():
    """Eksportuje umowy do CSV/Excel/PDF"""
    try:
        format_type = request.args.get('format', 'csv').lower()
        include_relations = request.args.get('includeRelations', 'false').lower() == 'true'
        columns = request.args.get('columns', '').split(',')
        
        if not columns or columns == ['']:
            columns = ['id', 'title', 'contractNumber', 'customerId', 'netAmount', 'signedAt']
        
        # Pobierz dane - dynamiczne zapytanie w zależności od kolumn
        select_fields = []
        for col in columns:
            if col == 'id':
                select_fields.append('co.Id')
            elif col == 'title':
                select_fields.append('co.Title')
            elif col == 'contractNumber':
                select_fields.append('co.ContractNumber')
            elif col == 'customerId':
                select_fields.append('co.CustomerId')
            elif col == 'customerName':
                select_fields.append('c.Name as CustomerName')
            elif col == 'placeOfSigning':
                select_fields.append('co.PlaceOfSigning')
            elif col == 'signedAt':
                select_fields.append('co.SignedAt')
            elif col == 'startDate':
                select_fields.append('co.StartDate')
            elif col == 'endDate':
                select_fields.append('co.EndDate')
            elif col == 'netAmount':
                select_fields.append('co.NetAmount')
            elif col == 'paymentTermDays':
                select_fields.append('co.PaymentTermDays')
            elif col == 'scopeOfServices':
                select_fields.append('co.ScopeOfServices')
        
        if not select_fields:
            select_fields = ['co.Id', 'co.Title', 'co.ContractNumber', 'co.CustomerId', 'c.Name as CustomerName', 'co.NetAmount', 'co.SignedAt']
        
        query = text(f"""
            SELECT {', '.join(select_fields)}
            FROM Contracts co
            LEFT JOIN Customers c ON co.CustomerId = c.Id
            ORDER BY co.SignedAt DESC
        """)
        
        result = db.session.execute(query)
        data = result.fetchall()
        
        headers = []
        for col in columns:
            if col == 'id':
                headers.append('ID')
            elif col == 'title':
                headers.append('Tytuł')
            elif col == 'contractNumber':
                headers.append('Numer umowy')
            elif col == 'customerId':
                headers.append('ID klienta')
            elif col == 'customerName':
                headers.append('Klient')
            elif col == 'placeOfSigning':
                headers.append('Miejsce podpisania')
            elif col == 'signedAt':
                headers.append('Data podpisania')
            elif col == 'startDate':
                headers.append('Data rozpoczęcia')
            elif col == 'endDate':
                headers.append('Data zakończenia')
            elif col == 'netAmount':
                headers.append('Kwota netto')
            elif col == 'paymentTermDays':
                headers.append('Termin płatności (dni)')
            elif col == 'scopeOfServices':
                headers.append('Zakres usług')
            else:
                headers.append(col)
        
        if format_type == 'csv':
            buffer = io.StringIO()
            writer = csv.writer(buffer)
            writer.writerow(headers)
            
            for row in data:
                writer.writerow(row)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'text/csv; charset=utf-8'
            response.headers['Content-Disposition'] = 'attachment; filename=umowy.csv'
            return response
            
        elif format_type == 'xlsx':
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet('Umowy')
            
            # Dodaj nagłówki
            for i, header in enumerate(headers):
                worksheet.write(0, i, header)
            
            # Dodaj dane
            for row_idx, row in enumerate(data, 1):
                for col_idx, value in enumerate(row):
                    worksheet.write(row_idx, col_idx, str(value) if value is not None else '')
            
            workbook.close()
            buffer.seek(0)
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = 'attachment; filename=umowy.xlsx'
            return response
            
        elif format_type == 'pdf':
            # Przygotuj dane dla PDF z dynamicznym formatowaniem
            pdf_data = []
            for row in data:
                pdf_row = list(row)
                
                # Formatuj dane w zależności od typu kolumny
                for i, col in enumerate(columns):
                    if i < len(pdf_row) and pdf_row[i] is not None:
                        # Format kwot
                        if col in ['netAmount']:
                            try:
                                pdf_row[i] = f"{float(pdf_row[i]):.2f} PLN"
                            except (ValueError, TypeError):
                                pdf_row[i] = str(pdf_row[i])
                        # Format dat
                        elif col in ['signedAt', 'startDate', 'endDate']:
                            if hasattr(pdf_row[i], 'strftime'):
                                pdf_row[i] = pdf_row[i].strftime('%d.%m.%Y')
                            else:
                                pdf_row[i] = str(pdf_row[i])
                        # Inne dane jako string
                        else:
                            pdf_row[i] = str(pdf_row[i])
                
                pdf_data.append(pdf_row)

            buffer = create_pdf_table(pdf_data, headers, "Raport umów")
            
            response = make_response(buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=umowy.pdf'
            return response
        
        else:
            return jsonify({'error': 'Nieobsługiwany format eksportu'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Błąd eksportu: {str(e)}'}), 500
    