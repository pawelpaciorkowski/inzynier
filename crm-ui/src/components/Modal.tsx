import { useModal } from '../context/ModalContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const icons = {
    success: <CheckCircleIcon className="h-10 w-10 text-green-500" aria-hidden="true" />,
    error: <XCircleIcon className="h-10 w-10 text-red-500" aria-hidden="true" />,
    confirm: <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" aria-hidden="true" />,
};

export function Modal() {
    const { isOpen, closeModal, options } = useModal();

    const handleConfirm = () => {
        if (options?.onConfirm) {
            options.onConfirm();
        }
        closeModal();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start space-x-4">
                                    {options && icons[options.type]}
                                    <div className="flex-1">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                                            {options?.title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-400">
                                                {options?.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    {options?.type === 'confirm' && (
                                        <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none" onClick={closeModal}>
                                            {options.confirmText ? 'Anuluj' : 'Zamknij'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none ${options?.type === 'confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        onClick={handleConfirm}
                                    >
                                        {options?.confirmText || 'OK'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}