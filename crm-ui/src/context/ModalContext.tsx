import { createContext, useContext, useState, type ReactNode } from 'react';

type ModalType = 'success' | 'error' | 'confirm';

interface ModalOptions {
    type: ModalType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
}

interface ModalContextType {
    isOpen: boolean;
    openModal: (options: ModalOptions) => void;
    closeModal: () => void;
    options: ModalOptions | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);

    const openModal = (newOptions: ModalOptions) => {
        setOptions(newOptions);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setOptions(null), 300);
    };

    const handleConfirm = () => {
        if (options?.onConfirm) {
            options.onConfirm();
        }
        closeModal();
    };

    return (
        <ModalContext.Provider value={{ isOpen, openModal, closeModal, options }}>
            {children}

            {isOpen && options && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl text-white">
                        <h2 className="text-2xl font-bold mb-4">
                            {options.type === 'success' && '✅ Sukces'}
                            {options.type === 'error' && '❌ Błąd'}
                            {options.type === 'confirm' && options.title}
                        </h2>
                        <p className="text-lg mb-6">{options.message}</p>

                        {options.type === 'confirm' && (
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={closeModal}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    {options.confirmText || 'Potwierdź'}
                                </button>
                            </div>
                        )}

                        {(options.type === 'success' || options.type === 'error') && (
                            <div className="flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};