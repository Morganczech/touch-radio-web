/**
 * Show a toast notification
 */
export function showToast(message: string, duration: number = 3000): void {
    // Remove existing toast if any
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Match CSS transition duration
    }, duration);
}
