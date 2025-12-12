import { showToast } from './utils.js';
import { db } from './firebase-config.js';
import { addToCart } from './cart.js';
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Загрузка данных товара по ID из URL
async function loadProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    console.warn('No product ID in URL');
    return null;
  }

  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
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

  document.title = `${product.name} - MarketPlace`;

  const titleEl = document.querySelector('.product-info__title');
  if (titleEl) titleEl.textContent = product.name;

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

  const mainImage = document.getElementById('main-product-image');
  if (mainImage && product.image) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  const thumbnailsContainer = document.querySelector('.product-gallery__thumbnails');
  const thumbnails = document.querySelectorAll('.thumbnail-image');
  if (thumbnails.length > 0 && product.image) {
    thumbnails[0].src = product.image;
    thumbnails[0].classList.add('active');

    // Reset thumbnails visibility first
    thumbnails.forEach((thumb, index) => {
        if (index > 0) thumb.style.display = 'none';
        thumb.classList.remove('active');
    });
    thumbnails[0].classList.add('active');

    if (product.images && product.images.length > 1) {
      product.images.forEach((imgSrc, index) => {
          if (index < thumbnails.length) {
              thumbnails[index].src = imgSrc;
              thumbnails[index].style.display = 'block';
          }
      });
    }
  }

  const descriptionEl = document.querySelector('.product-info__description');
  if (descriptionEl && product.description) {
    descriptionEl.textContent = product.description;
  }

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

  const breadcrumbActive = document.querySelector('.breadcrumbs__link--active');
  if (breadcrumbActive) breadcrumbActive.textContent = product.name;
  
  const breadcrumbItems = document.querySelectorAll('.breadcrumbs__link');
  if (breadcrumbItems.length >= 3 && product.category) {
    breadcrumbItems[breadcrumbItems.length - 2].textContent = product.category;
  }

  // Render Reviews
  renderReviews(product);
}

function renderReviews(product) {
    const reviews = product.reviews || [];
    const count = reviews.length;

    // Calculate stats
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = count > 0 ? (totalRating / count).toFixed(1) : "0.0";

    // Update Score
    const scoreEl = document.querySelector('.overall-rating__score');
    const countEl = document.querySelector('.overall-rating__count');
    if (scoreEl) scoreEl.textContent = avgRating;
    if (countEl) countEl.textContent = `of ${count} reviews`;

    // Update Summary Stars
    const summaryStars = document.querySelector('.overall-rating__stars');
    if (summaryStars) {
        summaryStars.innerHTML = generateStars(Math.round(avgRating));
    }

    // Update Bars
    const counts = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    reviews.forEach(r => {
        if (counts[r.rating] !== undefined) counts[r.rating]++;
    });

    const barsContainer = document.querySelector('.rating-bars');
    if (barsContainer) {
        barsContainer.innerHTML = '';
        for (let i = 5; i >= 1; i--) {
            const barCount = counts[i];
            const percentage = count > 0 ? (barCount / count) * 100 : 0;
            const barHtml = `
                <div class="rating-bar">
                  <span class="rating-label">${getLabelForRating(i)}</span>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                  </div>
                  <span class="rating-count">${barCount}</span>
                </div>
            `;
            barsContainer.innerHTML += barHtml;
        }
    }

    // Render List
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsList) {
        reviewsList.innerHTML = '';
        if (count === 0) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        } else {
            reviews.forEach(review => {
                const item = createReviewElement(review);
                reviewsList.appendChild(item);
            });
        }
    }
}

function getLabelForRating(r) {
    const labels = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Below Average', 1: 'Poor' };
    return labels[r] || '';
}

function createReviewElement(review) {
    const el = document.createElement('div');
    el.className = 'review-item';
    el.innerHTML = `
        <div class="review-item__avatar">
            <img src="assets/icons/User.svg" alt="User" style="background: #f5f5f5; padding: 10px;">
        </div>
        <div class="review-item__content">
            <div class="review-item__header">
                <span class="review-item__author">${review.author}</span>
                <span class="review-item__date">${review.date}</span>
            </div>
            <div class="review-item__stars">
                ${generateStars(review.rating)}
            </div>
            <p class="review-item__text">${review.text}</p>
        </div>
    `;
    return el;
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

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('product-loading');
  const productSection = document.querySelector('.product-details');

  const product = await loadProductData();

  if (loadingEl) loadingEl.style.display = 'none';

  if (!product) {
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

  // --- GALLERY --- //
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.thumbnail-image');

  if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        thumbnails.forEach((t) => t.classList.remove('active'));
        thumbnail.classList.add('active');
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
  if (description && description.innerHTML.includes('more...')) {
      const fullText = description.innerHTML.replace('more...', '') + ' ... (full text) ...';
      description.innerHTML = description.innerHTML.replace('more...', '<span class="description-toggle">more...</span>');
      const toggleBtn = description.querySelector('.description-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          description.innerHTML = fullText;
        });
      }
  }

  // --- ADD TO CART --- //
  const addToCartBtn = document.querySelector('.product-info__add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (product) {
          addToCart(product);
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
        starContainer.dataset.selectedRating = rating;
        highlightStars(rating);
      });
    });

    starContainer.addEventListener('mouseleave', () => {
      const selectedRating = parseInt(starContainer.dataset.selectedRating) || 0;
      highlightStars(selectedRating);
    });

  }

  function highlightStars(count) {
    const stars = document.querySelectorAll('#review-stars img');
    stars.forEach((s, i) => {
      if (i < count) {
        s.src = 'assets/icons/star.svg';
      } else {
        s.src = 'assets/icons/star-empty.svg';
      }
    });
  }

  // --- SUBMIT REVIEW --- //
  const reviewForm = document.getElementById('review-form');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = parseInt(ratingInput.value);
      const comment = document.getElementById('review-comment').value;

      if (!rating) {
        showToast('Please select a rating.');
        return;
      }

      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      const newReview = {
          author: "Guest User",
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          rating: rating,
          text: comment
      };

      try {
          const productRef = doc(db, "products", product.id);
          await updateDoc(productRef, {
              reviews: arrayUnion(newReview)
          });

          if (!product.reviews) product.reviews = [];
          product.reviews.unshift(newReview);
          renderReviews(product);

          showToast('Review added successfully!');
          reviewForm.reset();
          ratingInput.value = '0';
          if(starContainer) {
              starContainer.dataset.selectedRating = 0;
              highlightStars(0);
          }
      } catch (error) {
          console.error("Error submitting review:", error);
          showToast('Failed to submit review.');
      } finally {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
      }
    });
  }

  // --- AUTO RESIZE TEXTAREA --- //
  const textarea = document.getElementById('review-comment');
  if (textarea) {
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
      if (this.value === '') {
        this.style.height = '24px';
      }
    });
  }

  // --- VIEW MORE REVIEWS --- //
  const viewMoreBtn = document.querySelector('.reviews__footer .btn--secondary');
  if (viewMoreBtn) {
      // Logic for view more... already rendered all?
      // If we render all, this button might hide/show or just be removed.
      // For now, let's just make it do nothing or alert.
      viewMoreBtn.style.display = 'none'; // Hide it as we render all
  }
});
