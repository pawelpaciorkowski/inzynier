#!/bin/bash

# Skrypt do uruchamiania testów aplikacji CRM

echo "========================================="
echo "    Uruchamianie testów CRM Backend     "
echo "========================================="
echo ""

# Kolorowe outputy
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Sprawdź czy pytest jest zainstalowany
if ! command -v pytest &> /dev/null
then
    echo -e "${RED}pytest nie jest zainstalowany!${NC}"
    echo "Instaluję zależności testowe..."
    pip install -r requirements-test.txt
fi

# Sprawdź czy podano argument
if [ "$1" == "all" ]; then
    echo -e "${GREEN}Uruchamiam wszystkie testy...${NC}"
    pytest -v

elif [ "$1" == "auth" ]; then
    echo -e "${GREEN}Uruchamiam testy autoryzacji...${NC}"
    pytest tests/test_auth.py -v

elif [ "$1" == "customers" ]; then
    echo -e "${GREEN}Uruchamiam testy klientów...${NC}"
    pytest tests/test_customers.py -v

elif [ "$1" == "invoices" ]; then
    echo -e "${GREEN}Uruchamiam testy faktur...${NC}"
    pytest tests/test_invoices.py -v

elif [ "$1" == "other" ]; then
    echo -e "${GREEN}Uruchamiam testy pozostałych endpointów...${NC}"
    pytest tests/test_other_endpoints.py -v

elif [ "$1" == "advanced" ]; then
    echo -e "${GREEN}Uruchamiam zaawansowane testy...${NC}"
    pytest tests/test_example_advanced.py -v

elif [ "$1" == "coverage" ]; then
    echo -e "${GREEN}Uruchamiam testy z pokryciem kodu...${NC}"
    pytest --cov=app --cov-report=html --cov-report=term
    echo ""
    echo -e "${YELLOW}Raport pokrycia dostępny w: htmlcov/index.html${NC}"

elif [ "$1" == "quick" ]; then
    echo -e "${GREEN}Uruchamiam szybkie testy (bez advanced)...${NC}"
    pytest tests/test_auth.py tests/test_customers.py tests/test_invoices.py -v

elif [ "$1" == "failed" ]; then
    echo -e "${GREEN}Uruchamiam ponownie nieudane testy...${NC}"
    pytest --lf -v

elif [ "$1" == "help" ]; then
    echo "Użycie: ./run_tests.sh [opcja]"
    echo ""
    echo "Opcje:"
    echo "  all        - Uruchom wszystkie testy"
    echo "  auth       - Uruchom testy autoryzacji"
    echo "  customers  - Uruchom testy klientów"
    echo "  invoices   - Uruchom testy faktur"
    echo "  other      - Uruchom testy pozostałych endpointów"
    echo "  advanced   - Uruchom zaawansowane testy"
    echo "  coverage   - Uruchom testy z raportem pokrycia kodu"
    echo "  quick      - Uruchom tylko podstawowe testy (szybko)"
    echo "  failed     - Uruchom ponownie tylko nieudane testy"
    echo "  help       - Wyświetl tę pomoc"
    echo ""
    echo "Bez argumentu uruchamiane są wszystkie testy."

else
    echo -e "${GREEN}Uruchamiam wszystkie testy (domyślnie)...${NC}"
    echo -e "${YELLOW}Użyj './run_tests.sh help' aby zobaczyć dostępne opcje${NC}"
    echo ""
    pytest -v
fi

echo ""
echo "========================================="
echo "           Testy zakończone              "
echo "========================================="
