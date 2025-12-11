import { showToast } from './utils.js';
import { db } from './firebase-config.js';
import { addToCart } from './cart.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Загрузка данных товара по ID из URL
async function loadProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  console.log('Full URL:', window.location.href);
  console.log('Product ID from URL:', productId);
  
  if (!productId) {
    console.warn('No product ID in URL');
    return null;
  }

  try {
    console.log('Fetching product with ID:', productId);
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    console.log('Document exists:', productSnap.exists());
    
    if (productSnap.exists()) {
        const product = { ...productSnap.data(), id: productSnap.id };
      console.log('Product loaded:', product);
      return product;
    } else {
      console.error('Product not found for ID:', productId);
      return null;
    }
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
}

// Заполнение страницы данными товара
function populateProductPage(product) {
  if (!product) return;

  // Заголовок страницы
  document.title = `${product.name} - MarketPlace`;

  // Название товара
  const titleEl = document.querySelector('.product-info__title');
  if (titleEl) titleEl.textContent = product.name;

  // Цена
  const priceCurrentEl = document.querySelector('.product-info__price--current');
  if (priceCurrentEl) priceCurrentEl.textContent = `${product.price} BYN`;

  const priceOldEl = document.querySelector('.product-info__price--old');
  if (priceOldEl) {
    if (product.oldPrice) {
      priceOldEl.textContent = `${product.oldPrice} BYN`;
      priceOldEl.style.display = '';
    } else {
      priceOldEl.style.display = 'none';
    }
  }

  // Главное изображение
  const mainImage = document.getElementById('main-product-image');
  if (mainImage && product.image) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  // Миниатюры (если есть массив изображений)
  const thumbnailsContainer = document.querySelector('.product-gallery__thumbnails');
  const thumbnails = document.querySelectorAll('.thumbnail-image');
  if (thumbnails.length > 0 && product.image) {
    thumbnails[0].src = product.image;
    thumbnails[0].classList.add('active');
    // Скрываем остальные миниатюры если нет дополнительных изображений
    if (!product.images || product.images.length <= 1) {
      thumbnails.forEach((thumb, index) => {
        if (index > 0) thumb.style.display = 'none';
      });
    }
  }

  // Описание товара
  const descriptionEl = document.querySelector('.product-info__description');
  if (descriptionEl && product.description) {
    descriptionEl.textContent = product.description;
  }

  // Характеристики товара
  if (product.specs) {
    const specItems = document.querySelectorAll('.spec-item');
    specItems.forEach((item) => {
      const label = item.querySelector('.spec-item__label');
      if (label) {
        const span = label.querySelector('span');
        const labelText = label.textContent.trim().toLowerCase();
        
        if (labelText.includes('screen') && span) {
          span.textContent = product.specs.screenSize || '-';
        } else if (labelText.includes('cpu') && span) {
          span.textContent = product.specs.cpu || '-';
        } else if (labelText.includes('cores') && span) {
          span.textContent = product.specs.cores || '-';
        } else if (labelText.includes('main camera') && span) {
          span.textContent = product.specs.mainCamera || '-';
        } else if (labelText.includes('front') && span) {
          span.textContent = product.specs.frontCamera || '-';
        } else if (labelText.includes('battery') && span) {
          span.textContent = product.specs.battery || '-';
        }
      }
    });
  }

  // Хлебные крошки - последний элемент
  const breadcrumbActive = document.querySelector('.breadcrumbs__link--active');
  if (breadcrumbActive) breadcrumbActive.textContent = product.name;
  
  // Категория в хлебных крошках (предпоследний элемент)
  const breadcrumbItems = document.querySelectorAll('.breadcrumbs__link');
  if (breadcrumbItems.length >= 3 && product.category) {
    breadcrumbItems[breadcrumbItems.length - 2].textContent = product.category;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('product-loading');
  const productSection = document.querySelector('.product-details');

  // Загружаем данные товара
  const product = await loadProductData();

  if (loadingEl) loadingEl.style.display = 'none';

  if (!product) {
    // Показываем сообщение об ошибке
    if (productSection) {
      productSection.style.display = 'block';
      productSection.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Товар не найден</h2>
          <p style="color: #666; margin-bottom: 30px;">Возможно, товар был удален или ссылка устарела.</p>
          <a href="shop.html" class="btn btn--primary">Вернуться в магазин</a>
        </div>
      `;
    }
    return;
  }

  if (productSection) productSection.style.display = 'flex';
  populateProductPage(product);
  // --- GALLERY FUNCTIONALITY --- //
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.thumbnail-image');

  if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        // Remove active class from all thumbnails
        thumbnails.forEach((t) => t.classList.remove('active'));
        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
        // Update main image source
        if (mainImage) {
          mainImage.src = thumbnail.src;
        }
      });
    });
  }

  // --- COLOR SELECTION --- //
  const colorSwatches = document.querySelectorAll('.color-swatch');

  if (colorSwatches.length > 0) {
    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });
  }

  // --- MEMORY SELECTION --- //
  const memoryButtons = document.querySelectorAll('.memory-button');

  if (memoryButtons.length > 0) {
    memoryButtons.forEach((button) => {
      if (!button.hasAttribute('disabled')) {
        button.addEventListener('click', () => {
          memoryButtons.forEach((b) => b.classList.remove('active'));
          button.classList.add('active');
        });
      }
    });
  }

  // --- DESCRIPTION TOGGLE --- //
  const description = document.querySelector('.product-info__description');
  if (description) {
    // Let's wrap "more..." in a span if it's not already
    if (description.innerHTML.includes('more...')) {
      const fullText =
        description.innerHTML.replace('more...', '') +
        ' This allows for stunning low-light photography and cinematic video quality. The new Action mode provides smooth handheld videos even when you are moving around. The display is 2x brighter outdoors.';

      description.innerHTML = description.innerHTML.replace(
        'more...',
        '<span class="description-toggle">more...</span>',
      );

      const toggleBtn = description.querySelector('.description-toggle');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          description.innerHTML = fullText;
        });
      }
    }
  }

  // --- ADD TO CART --- //
  const addToCartBtn = document.querySelector('.product-info__add-to-cart');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      // We need to use the 'product' object loaded at the beginning.
      // Ensure 'product' is available here. It is because we are in the populateProductPage scope?
      // No, populateProductPage is outside.
      // But we are inside 'DOMContentLoaded' callback where 'product' was fetched.
      // Wait, this event listener is inside 'DOMContentLoaded'.

      if (product) {
          addToCart(product);

          // Feedback
          const originalText = addToCartBtn.textContent;
          addToCartBtn.textContent = 'Added!';
          setTimeout(() => {
            addToCartBtn.textContent = originalText;
          }, 2000);
      }
    });
  }

  // --- REVIEW FORM STAR INTERACTION --- //
  const starContainer = document.getElementById('review-stars');
  const ratingInput = document.getElementById('review-rating');

  if (starContainer) {
    const stars = starContainer.querySelectorAll('img');

    stars.forEach((star, index) => {
      star.addEventListener('mouseover', () => {
        highlightStars(index + 1);
      });

      star.addEventListener('click', () => {
        const rating = index + 1;
        ratingInput.value = rating;
        // Store selected rating to ensure it stays after mouseout
        starContainer.dataset.selectedRating = rating;
        highlightStars(rating);
      });
    });

    starContainer.addEventListener('mouseleave', () => {
      const selectedRating = parseInt(starContainer.dataset.selectedRating) || 0;
      highlightStars(selectedRating);
    });

    function highlightStars(count) {
      stars.forEach((s, i) => {
        if (i < count) {
          s.src = 'assets/icons/star.svg';
        } else {
          s.src = 'assets/icons/star-empty.svg';
        }
      });
    }
  }

  // --- SUBMIT REVIEW --- //
  const reviewForm = document.getElementById('review-form');
  const reviewsList = document.getElementById('reviews-list');

  if (reviewForm && reviewsList) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rating = ratingInput.value;
      const comment = document.getElementById('review-comment').value;

      if (rating === '0') {
        showToast('Please select a rating.');
        return;
      }

      // Create new review item
      const date = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const newReview = document.createElement('div');
      newReview.className = 'review-item';
      newReview.innerHTML = `
                <div class="review-item__avatar">
                    <img src="assets/icons/User.svg" alt="User" style="background: #f5f5f5; padding: 10px;">
                </div>
                <div class="review-item__content">
                    <div class="review-item__header">
                        <span class="review-item__author">You</span>
                        <span class="review-item__date">${date}</span>
                    </div>
                    <div class="review-item__stars">
                        ${generateStars(rating)}
                    </div>
                    <p class="review-item__text">${comment}</p>
                </div>
            `;

      // Prepend to list
      reviewsList.insertBefore(newReview, reviewsList.firstChild);

      // Reset form
      reviewForm.reset();
      ratingInput.value = '0';
      starContainer.dataset.selectedRating = 0;
      const stars = starContainer.querySelectorAll('img');
      stars.forEach((s) => (s.src = 'assets/icons/star-empty.svg'));
    });
  }

  function generateStars(rating) {
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        starsHtml += '<img src="assets/icons/star.svg" alt="star">';
      } else {
        starsHtml += '<img src="assets/icons/star-empty.svg" alt="star">';
      }
    }
    return starsHtml;
  }

  // --- AUTO RESIZE TEXTAREA --- //
  const textarea = document.getElementById('review-comment');
  if (textarea) {
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
      if (this.value === '') {
        this.style.height = '24px'; // Reset to initial height
      }
    });
  }

  // --- VIEW MORE REVIEWS --- //
  const viewMoreBtn = document.querySelector('.reviews__footer .btn--secondary');

  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      // Simulate loading more
      const originalText = viewMoreBtn.textContent;
      viewMoreBtn.textContent = 'Loading...';

      setTimeout(() => {
        // Clone the existing reviews to add more
        const currentReviews = reviewsList.querySelectorAll('.review-item');

        // Clone the last 2 reviews and append
        if (currentReviews.length > 0) {
          for (let i = 0; i < Math.min(2, currentReviews.length); i++) {
            const clone = currentReviews[i].cloneNode(true);
            reviewsList.appendChild(clone);
          }
        }

        viewMoreBtn.textContent = originalText;
      }, 1000);
    });
  }
});
