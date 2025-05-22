export function copyToClipboard(text: string): Promise<void> {
    // 檢查是否支持新的異步剪貼板 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard using Clipboard API');
        }).catch(err => {
            console.warn('Failed to copy text: ', err);
            return fallbackCopyTextToClipboard(text);
        });
    } else {
        return fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Fallback: Copying text command was successful');
                resolve();
            } else {
                console.error('Fallback: Unable to copy');
                reject(new Error('Fallback: Unable to copy'));
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            reject(err);
        }

        document.body.removeChild(textArea);
    });
}