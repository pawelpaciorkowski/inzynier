import { createContext, useContext, useState, type ReactNode } from 'react';

type ModalType = 'success' | 'error' | 'confirm' | 'custom' | 'info';

interface ModalOptions {
    type: ModalType;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    content?: ReactNode;
}

interface ModalContextType {
    isOpen: boolean;
    openModal: (options: ModalOptions) => void;
    closeModal: () => void;
    options: ModalOptions | null;
    openToast: (message: string, type?: 'success' | 'error', duration?: number) => void;
    openConfirmModal: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean } | null>(null);
    const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

    const openModal = (newOptions: ModalOptions) => {
        setOptions(newOptions);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setOptions(null), 300);
    };

    const openToast = (message: string, type: 'success' | 'error' = 'success', duration = 2500) => {
        if (toastTimeout) clearTimeout(toastTimeout);
        setToast({ message, type, visible: true });
        const timeout = setTimeout(() => {
            setToast(t => t ? { ...t, visible: false } : null);
            setTimeout(() => setToast(null), 400); // fade out
        }, duration);
        setToastTimeout(timeout);
    };

    const openConfirmModal = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            openModal({
                type: 'confirm',
                title,
                message,
                onConfirm: () => {
                    resolve(true);
                },
                onCancel: () => {
                    resolve(false);
                },
            });
        });
    };

    const handleConfirm = () => {
        if (options?.onConfirm) {
            options.onConfirm();
        }
        closeModal();
    };

    return (
        <ModalContext.Provider value={{ isOpen, openModal, closeModal, options, openToast, openConfirmModal }}>
            {children}

            {isOpen && options && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl text-white">
                        {options.type === 'custom' ? (
                            options.content
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4">
                                    {options.type === 'success' && '✅ Sukces'}
                                    {options.type === 'error' && '❌ Błąd'}
                                    {options.type === 'confirm' && options.title}
                                    {options.type === 'info' && options.title}
                                </h2>
                                <p className="text-lg mb-6">{options.message}</p>

                                {options.type === 'confirm' && (
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => {
                                                if (options.onCancel) options.onCancel();
                                                closeModal();
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            {options.cancelText || 'Anuluj'}
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

                                {options.type === 'info' && (
                                    <div className="flex justify-end space-x-4">
                                        {options.cancelText && (
                                            <button
                                                onClick={() => {
                                                    if (options.onCancel) options.onCancel();
                                                    closeModal();
                                                }}
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                {options.cancelText}
                                            </button>
                                        )}
                                        {options.confirmText && (
                                            <button
                                                onClick={() => {
                                                    if (options.onConfirm) options.onConfirm();
                                                    closeModal();
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                {options.confirmText}
                                            </button>
                                        )}
                                        {!(options.cancelText || options.confirmText) && (
                                            <button
                                                onClick={closeModal}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                OK
                                            </button>
                                        )}
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Globalny toast */}
            {toast && toast.visible && (
                <div className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-all duration-400 animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ minWidth: 220, opacity: toast.visible ? 1 : 0 }}>
                    {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
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