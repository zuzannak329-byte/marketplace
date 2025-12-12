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
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        starsHtml += '<img src="assets/icons/star.svg" alt="star" width="16" height="16">';
      } else {
        starsHtml += '<img src="assets/icons/star-empty.svg" alt="star" width="16" height="16">';
      }
    }
    return starsHtml;
}
