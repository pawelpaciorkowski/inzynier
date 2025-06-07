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
        // Krótkie opóźnienie, aby modal zdążył zniknąć przed wyczyszczeniem opcji
        setTimeout(() => setOptions(null), 300);
    };

    return (
        <ModalContext.Provider value={{ isOpen, openModal, closeModal, options }}>
            {children}
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