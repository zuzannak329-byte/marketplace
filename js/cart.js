// js/cart.js

const CART_STORAGE_KEY = "shopping_cart";

// Helper: Get cart from local storage
export function getCart() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
}

// Helper: Save cart to local storage
export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Add item to cart
export function addToCart(product) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.id === product.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

// Remove item from cart
export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCartItems();
}

// Update item quantity
export function updateQuantity(productId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex > -1) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      cart[itemIndex].quantity = newQuantity;
      saveCart(cart);
      renderCartItems();
    }
  }
}

// Update cart count in header
export function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const countElements = document.querySelectorAll("#cart-count, .cart-button__count");
  countElements.forEach(el => {
    el.textContent = count;
  });
}

// Calculate totals
function calculateTotals(cart) {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = 50;
  const shipping = 29;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}

// Render cart items in cart.html
export function renderCartItems() {
  const cartListContainer = document.querySelector(".cart-list");
  const cartSummaryContainer = document.querySelector(".cart-summary__details");

  if (!cartListContainer) return;

  const cart = getCart();

  cartListContainer.innerHTML = "";

  if (cart.length === 0) {
    cartListContainer.innerHTML = "<p class=\"cart-empty-message\">Your cart is empty.</p>";
    if (cartSummaryContainer) {
       document.querySelector(".summary-value").textContent = "$0";
       document.querySelector(".summary-total .summary-value").textContent = "$0";
    }
    return;
  }

  cart.forEach((item) => {
    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="cart-item__image-col">
        <img src="${item.image}" alt="${item.name}" class="cart-item__image" />
      </div>
      <div class="cart-item__content">
        <div class="cart-item__info">
          <h3 class="cart-item__name">${item.name}</h3>
          <p class="cart-item__id">#${item.id}</p>
        </div>
        <div class="cart-item__actions">
          <div class="quantity-control">
            <button class="quantity-btn decrease" aria-label="Decrease quantity" data-id="${item.id}">−</button>
            <input type="number" class="quantity-input" value="${item.quantity}" readonly />
            <button class="quantity-btn increase" aria-label="Increase quantity" data-id="${item.id}">+</button>
          </div>
          <div class="cart-item__price">$${item.price}</div>
          <button class="cart-item__remove" aria-label="Remove item" data-id="${item.id}">
            <img src="assets/icons/close.svg" alt="Remove" />
          </button>
        </div>
      </div>
    `;
    cartListContainer.appendChild(itemElement);
  });

  const quantityControls = cartListContainer.querySelectorAll(".quantity-control");
  quantityControls.forEach(control => {
      control.addEventListener("click", (e) => {
          if (e.target.classList.contains("decrease") || e.target.textContent === "−") {
              const btn = e.target.classList.contains("decrease") ? e.target : e.target.closest("button");
              const id = btn.dataset.id;
              const item = cart.find(i => i.id === id);
              if (item) updateQuantity(item.id, item.quantity - 1);
          }
          if (e.target.classList.contains("increase") || e.target.textContent === "+") {
              const btn = e.target.classList.contains("increase") ? e.target : e.target.closest("button");
              const id = btn.dataset.id;
              const item = cart.find(i => i.id === id);
              if (item) updateQuantity(item.id, item.quantity + 1);
          }
      });
  });

  const removeButtons = cartListContainer.querySelectorAll(".cart-item__remove");
  removeButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
          const button = e.target.closest(".cart-item__remove");
          if (button) {
              const id = button.dataset.id;
              removeFromCart(id);
          }
      });
  });

  updateCartSummary(cart);
}

function updateCartSummary(cart) {
  const { subtotal, tax, shipping, total } = calculateTotals(cart);

  const subtotalEl = document.querySelector(".cart-summary__details .summary-row:nth-child(1) .summary-value");
  const taxEl = document.querySelector(".summary-group .summary-row:nth-child(1) .summary-value");
  const shippingEl = document.querySelector(".summary-group .summary-row:nth-child(2) .summary-value");
  const totalEl = document.querySelector(".summary-total .summary-value");

  if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
  if (taxEl) taxEl.textContent = `$${tax}`;
  if (shippingEl) shippingEl.textContent = `$${shipping}`;
  if (totalEl) totalEl.textContent = `$${total}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartItems();
});
