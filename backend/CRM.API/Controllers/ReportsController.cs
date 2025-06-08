using CRM.BusinessLogic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")] // <--- POPRAWKA
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;

    public ReportsController(ReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("clients")]
    public async Task<IActionResult> GetClientsReport()
    {
        var pdfBytes = await _reportService.GenerateClientsReportAsync();
        return File(pdfBytes, "application/pdf", "raport-klientow.pdf");
    }
}