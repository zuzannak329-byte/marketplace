import { db } from './firebase-config.js';
import { updateCartCount } from './cart.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Глобальное хранилище товаров и состояния фильтров
let allProducts = [];
let currentCategory = 'All';
let currentSort = 'rating';

const initApp = () => {
  console.log('Initializing App...');
  
  updateCartCount();

  // 1. Проверка GSAP
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn('GSAP is not loaded. Animations disabled.');
    document.documentElement.style.visibility = 'visible';
  }

  // 2. Инициализация модулей
  initMobileMenu();
  initHeroSlider();
  initProductRendering();
  initCustomSelect();
  initSidebarFilters();

  // 3. Анимации
  initAnimations();
  initTiltEffect();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * 1. Мобильное меню
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const navLinks = document.querySelectorAll('.mobile-nav-list__link');

  if (!menuToggle || !mobileMenu) return;

  const toggleMenu = (isActive) => {
    menuToggle.classList.toggle('active', isActive);
    mobileMenu.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => {
    const isActive = !mobileMenu.classList.contains('active');
    toggleMenu(isActive);
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggleMenu(false);
  });

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => toggleMenu(false));
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/**
 * 2. Слайдер Hero
 */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  const slides = document.querySelectorAll('.hero__slide');
  const paginationContainer = document.querySelector('.slider-pagination');

  if (!slider || !slides.length) return;

  let currentIndex = 0;
  let interval;
  const slideCount = slides.length;

  if (paginationContainer) {
    paginationContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `pagination-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      paginationContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.pagination-dot');

  const updateSlider = () => {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  };

  const goToSlide = (index) => {
    currentIndex = index;
    updateSlider();
    resetInterval();
  };

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  };

  const startInterval = () => {
    interval = setInterval(nextSlide, 6000);
  };

  const resetInterval = () => {
    clearInterval(interval);
    startInterval();
  };

  slider.addEventListener('mouseenter', () => clearInterval(interval));
  slider.addEventListener('mouseleave', startInterval);

  startInterval();
}

/**
 * 3. Рендеринг товаров
 */
async function initProductRendering() {
  const popularGrid = document.querySelector('.popular-products__grid');
  const shopGrid = document.querySelector('.shop-products__grid');

  if (!popularGrid && !shopGrid) return;

  // Функция создания skeleton карточки
  const createSkeletonCard = () => {
    const skeleton = document.createElement('div');
    skeleton.className = 'product-card--skeleton';
    skeleton.innerHTML = `
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-button"></div>
    `;
    return skeleton;
  };

  // Показываем skeleton пока грузятся данные
  const skeletonCount = 8;
  if (popularGrid) {
    popularGrid.innerHTML = '';
    for (let i = 0; i < skeletonCount; i++) {
      popularGrid.appendChild(createSkeletonCard());
    }
  }
  if (shopGrid) {
    shopGrid.innerHTML = '';
    for (let i = 0; i < skeletonCount; i++) {
      shopGrid.appendChild(createSkeletonCard());
    }
  }

  console.log('Fetching products from Firestore...');

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    console.log(`Found ${snapshot.size} products in Firestore.`);

    if (snapshot.empty) {
        console.warn('No products found! Did you run seedProducts()?');
    }
    
    snapshot.forEach((doc) => {
      allProducts.push({ ...doc.data(), id: doc.id });
    });

    console.log('Products loaded:', allProducts);

    // Заменяем skeleton на реальные карточки
    if (popularGrid) {
      const popular = allProducts.filter((p) => p.popular).slice(0, 8);
      popularGrid.innerHTML = '';
      popular.forEach((product) => popularGrid.appendChild(createProductCard(product)));
    }

    if (shopGrid) {
      renderShopProducts();
      updateProductCount();
    }

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Функция создания карточки товара
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  card.innerHTML = `
      <div class="product-card__image-wrapper">
          <img src="${product.image}" alt="${product.name}" class="product-card__image">
      </div>
      <div class="product-card__info">
          <h3 class="product-card__title">${product.name}</h3>
          <div class="product-card__price-wrapper">
              <p class="product-card__price">${product.price} BYN</p>
              ${product.oldPrice ? `<p class="product-card__old-price">${product.oldPrice} BYN</p>` : ''}
          </div>
      </div>
      <a href="product.html?id=${product.id}" class="btn btn--primary product-card__button">Buy Now</a>
  `;
  return card;
}

// Функция рендеринга товаров в магазине с учетом фильтров и сортировки
function renderShopProducts() {
  const shopGrid = document.querySelector('.shop-products__grid');
  if (!shopGrid) return;

  // Фильтрация по категории
  let filtered = allProducts;
  if (currentCategory !== 'All') {
    filtered = allProducts.filter(p => p.category === currentCategory);
  }

  // Сортировка
  switch (currentSort) {
    case 'price-asc':
      filtered = [...filtered].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered = [...filtered].sort((a, b) => b.price - a.price);
      break;
    case 'rating':
    default:
      // По умолчанию - без сортировки (или можно добавить поле rating)
      break;
  }

  shopGrid.innerHTML = '';
  filtered.forEach((product) => shopGrid.appendChild(createProductCard(product)));
  
  updateProductCount(filtered.length);
}

// Обновление счетчика товаров
function updateProductCount(count) {
  const countSpan = document.querySelector('.shop-products__count span');
  if (countSpan) {
    countSpan.textContent = count !== undefined ? count : allProducts.length;
  }
}

/**
 * 4. Кастомный Select (Сортировка)
 */
function initCustomSelect() {
  const customSelect = document.querySelector('.custom-select');
  if (!customSelect) return;

  const trigger = customSelect.querySelector('.custom-select__trigger');
  const options = customSelect.querySelectorAll('.custom-option');
  const valueSpan = trigger.querySelector('.custom-select__value');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelect.classList.toggle('open');
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const selectedValue = option.getAttribute('data-value');
      valueSpan.textContent = option.textContent;
      options.forEach((opt) => opt.classList.remove('selected'));
      option.classList.add('selected');
      customSelect.classList.remove('open');
      
      // Применяем сортировку
      currentSort = selectedValue;
      renderShopProducts();
    });
  });

  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('open');
    }
  });
}

/**
 * 5. Фильтры по категориям
 */
function initSidebarFilters() {
  const headers = document.querySelectorAll('.filter-group__header');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      group.classList.toggle('open');
    });
  });

  const links = document.querySelectorAll('.filter-group__link');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const list = link.closest('.filter-group__list');
      list
        .querySelectorAll('.filter-group__link')
        .forEach((l) => l.classList.remove('filter-group__link--active'));
      link.classList.add('filter-group__link--active');
      
      // Применяем фильтр по категории
      currentCategory = link.textContent.trim();
      renderShopProducts();
    });
  });
}

/**
 * 6. GSAP Анимации (Без эффекта печати)
 * Классическое плавное появление снизу-вверх
 */
function initAnimations() {
  // --- A. Hero Section ---
  const heroSection = document.querySelector('.hero');

  if (heroSection) {
    const tl = gsap.timeline();

    // 1. Начальное состояние
    // Скрываем весь текст и кнопку, смещаем вниз
    gsap.set('.hero__content > *', { autoAlpha: 0, y: 30 });
    // Скрываем контейнер картинки, смещаем вправо
    gsap.set('.hero__media', { autoAlpha: 0, x: 50 });

    // 2. Анимация появления
    tl
      // Текст всплывает каскадом (Stagger)
      .to('.hero__content > *', {
        autoAlpha: 1, // Плавно проявляется
        y: 0, // Встает на место
        duration: 1,
        stagger: 0.2, // Задержка между элементами (надзаголовок -> заголовок -> описание -> кнопка)
        ease: 'power3.out',
      })
      // Картинка выезжает параллельно с кнопкой
      .to(
        '.hero__media',
        {
          autoAlpha: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
        },
        '-=0.8',
      ); // Начинается за 0.8сек до конца анимации текста

    // 3. Левитация картинки (Контейнера)
    // Работает независимо от появления
    gsap.to('.hero__media', {
      y: -15,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 0.5,
    });
  }

  // --- B. Скролл (Товары) ---
  ScrollTrigger.batch('.category-card', {
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
      }),
  });

  // ScrollTrigger для .product-card удален, так как анимация вызывается явно после загрузки данных

  // --- C. Параллакс ---
  const saleSection = document.querySelector('.summer-sale');
  if (saleSection) {
    gsap.to('.summer-sale', {
      backgroundPosition: `50% 100%`,
      ease: 'none',
      scrollTrigger: {
        trigger: '.summer-sale',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.from('.summer-sale__content', {
      y: 50,
      opacity: 0.5,
      scrollTrigger: {
        trigger: '.summer-sale',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    });
  }

  // --- D. Магнитные кнопки ---
  const buttons = document.querySelectorAll('.btn--primary, .btn--secondary');
  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  });
}

/**
 * 7. Tilt Effect
 * Наклон картинки внутри левитирующего контейнера
 */
function initTiltEffect() {
  if (typeof $.fn.tilt === 'function') {
    $('.hero__image').tilt({
      maxTilt: 10,
      perspective: 1000,
      scale: 1.02,
      speed: 1000,
      glare: true,
      maxGlare: 0.2,
    });
  }
}
