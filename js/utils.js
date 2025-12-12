export function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    
    // Если тоста нет в DOM, создаем его (хотя он есть в HTML, но на всякий случай)
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message"></span>
                <button class="toast-close" id="toast-close">&times;</button>
            </div>
        `;
        document.body.appendChild(toast);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('visible');
            setTimeout(() => {
                 toast.style.display = 'none';
            }, 300);
        });
    }

    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    // Стилизация в зависимости от типа (если нужно)
    // В текущем CSS toast черный, можно добавить модификаторы
    
    toast.style.display = 'flex';
    // Небольшая задержка для анимации opacity
    setTimeout(() => {
        toast.classList.add('visible');
    }, 10);

    // Автоскрытие
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
             toast.style.display = 'none';
        }, 300);
    }, 3000);
}

export function showFormError(form, message) {
    if (!form) return;

    let errorContainer = form.querySelector('.form-error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-error-message';
        // Вставляем в начало формы
        form.insertBefore(errorContainer, form.firstChild);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

export function clearFormError(form) {
    if (!form) return;
    const errorContainer = form.querySelector('.form-error-message');
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
    }
}

export function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    let hasHalfStar = false;

    // Determine if we should show a half star
    if (decimal >= 0.25 && decimal < 0.75) {
        hasHalfStar = true;
    } else if (decimal >= 0.75) {
        // Round up to next full star if it's very close (optional, but standard 4.8 -> 5)
        // But the user screenshot shows 4.8 as 4.5 stars.
        // Let's stick to: if it's not a full integer, check for half.
        // If I strictly follow "4.8 shows 4.5 stars", then anything between X.0 and X.9 is X.5?
        // That seems wrong.
        // Let's stick to standard rounding logic.
        // If 4.8, effectively 5 stars.
        // If 4.2, effectively 4 stars.
        // If 4.4 - 4.6, 4.5 stars.
    }

    // However, to match the "4.8 with half star" screenshot strictly:
    // Maybe they just truncate to 4.5 if it's not 5?
    // Let's use a logic that favors half stars for anything with a significant decimal.

    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
             starsHtml += '<img src="assets/icons/star.svg" alt="star" width="16" height="16">';
        } else if (rating >= i - 0.75 && rating < i) { // e.g., 4.25 to 4.99 -> half star? No.
             // If rating is 4.8.
             // i=1..4: full.
             // i=5: 4.8 >= 4.25? Yes. So half star.
             // This logic: if rating is 4.1. i=5. 4.1 >= 4.25? No. Empty.
             starsHtml += '<img src="assets/icons/star-half.svg" alt="star" width="16" height="16">';
        } else {
             starsHtml += '<img src="assets/icons/star-empty.svg" alt="star" width="16" height="16">';
        }
    }
    // Wait, the loop logic above is slightly flawed because it might add multiple half stars or skip.
    // Let's do it explicitly.

    starsHtml = '';
    for(let i=1; i<=5; i++) {
        if (rating >= i - 0.25) { // 4.8 >= 0.75 (i=1), ..., 4.8 >= 4.75 (i=5) -> Full
             starsHtml += '<img src="assets/icons/star.svg" alt="star" width="16" height="16">';
        } else if (rating >= i - 0.75) { // 4.5 >= 4.25 (i=5) -> Half
             starsHtml += '<img src="assets/icons/star-half.svg" alt="star" width="16" height="16">';
        } else {
             starsHtml += '<img src="assets/icons/star-empty.svg" alt="star" width="16" height="16">';
        }
    }

    return starsHtml;
}
