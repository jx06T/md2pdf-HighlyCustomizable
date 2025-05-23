import { createRoot } from 'react-dom/client';

function createConfirmDialog(title: string, message: string, onConfirm: Function, onCancel: Function, confirmText = "Confirm", cancelText = "Cancel"): void {

    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);

    const root = createRoot(dialogRoot);

    const ConfirmDialog = () => {
        const handleConfirm = () => {
            onConfirm();
            root.unmount();
            document.body.removeChild(dialogRoot);
        };

        const handleCancel = () => {
            onCancel();
            root.unmount();
            document.body.removeChild(dialogRoot);
        };

        return (
            <div className="z-50 confirm-dialog-overlay flex justify-center fixed w-full top-36 left-1 right-1 px-4 pl-2">
                <div className="confirm-dialog max-w-[92%] min-w-80">
                    <div className=' bg-blue-50 rounded-md rounded-b-none w-fit px-4 py-1 -mb-1 shadow-md shadow-blue-100 '><h1 className='text-xl underline decoration-2 decoration-purple-500'>{title}</h1></div>
                    <div className='bg-blue-50 rounded-tl-none rounded-md p-4 px-5 min-h-40 flex-col flex justify-between shadow-md shadow-blue-100'>
                        <pre className=' text-wrap whitespace-pre-wrap px-3'>{message}</pre>
                        <div className=' w-full flex justify-end space-x-4'>
                            <button className=' cursor-pointer px-2 rounded-full border-2 border-purple-500 hover:bg-purple-300' onClick={handleCancel}>{cancelText}</button>
                            <button className=' cursor-pointer px-2 rounded-full border-2 border-red-500 hover:bg-red-300' onClick={handleConfirm}>{confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    root.render(<ConfirmDialog />);
};

export default createConfirmDialog
