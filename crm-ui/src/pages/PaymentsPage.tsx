import { CreditCardIcon } from '@heroicons/react/24/outline';

export function PaymentsPage() {
    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Płatności</h1>
            <div className="bg-gray-800 p-10 rounded-lg text-center flex flex-col items-center shadow-lg">
                <CreditCardIcon className="w-16 h-16 text-blue-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Moduł Płatności</h2>
                <p className="text-gray-400 max-w-md">
                    Ta sekcja jest w trakcie intensywnego rozwoju. Wkrótce znajdziesz tutaj możliwość zarządzania fakturami, śledzenia płatności i integracji z systemami płatniczymi.
                </p>
            </div>
        </div>
    );
}