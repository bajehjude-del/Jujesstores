/* ============================================================
   JUJES STORES — script.js
   Menu data, cart state, receipt rendering, WhatsApp checkout,
   and scroll / nav animations.
   ============================================================ */

// ---- Store contact: replace with the real WhatsApp number (country code, no + or spaces) ----
const WHATSAPP_NUMBER = "2349055279686";

// ---- Menu data ----
const FOOD_ITEMS = [
  { id: "f1", name: "Suya Loaded Fries", desc: "Crispy fries piled with suya-spiced beef, cheese sauce and pepper.", price: 6000, emoji: "🍟" },
  { id: "f2", name: "Chicken Loaded Fries", desc: "Grilled chicken strips, cheese, chili mayo, spring onion.", price: 7000, emoji: "🍟" },
  { id: "f3", name: "Jujes Classic Burger", desc: "Beef patty, cheddar, house sauce, toasted bun.", price: 5500, emoji: "🍔" },
  { id: "f4", name: "Double Beef Burger", desc: "Two smashed patties, double cheese, pickles, special sauce.", price: 6500, emoji: "🍔" },
  { id: "f5", name: "Chicken Shawarma", desc: "Grilled chicken, garlic sauce, veggies, wrapped hot.", price: 4000, emoji: "🌯" },
  { id: "f6", name: "Beef Shawarma", desc: "Shredded beef, coleslaw, chili sauce, tight wrap.", price: 5000, emoji: "🌯" },
  { id: "f7", name: "Mixed Shawarma", desc: "Chicken and beef combined for the indecisive.", price: 5000, emoji: "🌯" },
];

const DRINK_ITEMS = [
  { id: "d1", name: "Kunu Zaki", desc: "Millet & spice blend, chilled — the northern classic.", price: 500, emoji: "🥛" },
  { id: "d2", name: "Kunu Aya (Tigernut)", desc: "Creamy tigernut Kunu, naturally sweet.", price: 800, emoji: "🥛" },
  { id: "d3", name: "Zobo Classic", desc: "Hibiscus, cloves & cucumber, served ice cold.", price: 500, emoji: "🧃" },
  { id: "d4", name: "Zobo Ginger-Pineapple", desc: "Hibiscus steeped with ginger and fresh pineapple.", price: 800, emoji: "🧃" },
];

const ALL_ITEMS = [...FOOD_ITEMS, ...DRINK_ITEMS];

// ---- Cart state: { id: qty } ----
const cart = {};

// ================= RENDER MENU CARDS =================
function renderGrid(items, mountId){
  const mount = document.getElementById(mountId);
  mount.innerHTML = items.map(item => `
    <article class="food-card" data-id="${item.id}">
      <div class="food-card-top">
        <span class="food-emoji">${item.emoji}</span>
      </div>
      <span class="food-name">${item.name}</span>
      <p class="food-desc">${item.desc}</p>
      <div class="food-bottom">
        <span class="food-price">₦${item.price.toLocaleString()}</span>
        <button class="add-btn" data-id="${item.id}">Add +</button>
      </div>
    </article>
  `).join("");
}
renderGrid(FOOD_ITEMS, "foodGrid");
renderGrid(DRINK_ITEMS, "drinkGrid");

// ================= CART LOGIC =================
const cartCountEl = document.getElementById("cartCount");
const receiptItemsEl = document.getElementById("receiptItems");
const receiptEmptyEl = document.getElementById("receiptEmpty");
const receiptTotalEl = document.getElementById("receiptTotal");

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  bumpCartIcon();
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  renderCart();
}

function cartTotalCount(){
  return Object.values(cart).reduce((a,b) => a+b, 0);
}
function cartTotalPrice(){
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = ALL_ITEMS.find(i => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
}

function renderCart(){
  const entries = Object.entries(cart);
  cartCountEl.textContent = cartTotalCount();

  if(entries.length === 0){
    receiptEmptyEl.style.display = "block";
    receiptItemsEl.querySelectorAll(".receipt-item").forEach(n => n.remove());
  } else {
    receiptEmptyEl.style.display = "none";
    receiptItemsEl.innerHTML = "";
    entries.forEach(([id, qty]) => {
      const item = ALL_ITEMS.find(i => i.id === id);
      if(!item) return;
      const row = document.createElement("div");
      row.className = "receipt-item";
      row.innerHTML = `
        <span class="receipt-item-name">${item.name}</span>
        <span class="receipt-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${id}">−</button>
          ${qty}
          <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
        </span>
        <span>₦${(item.price*qty).toLocaleString()}</span>
      `;
      receiptItemsEl.appendChild(row);
    });
  }
  receiptTotalEl.textContent = `₦${cartTotalPrice().toLocaleString()}`;
}

function bumpCartIcon(){
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth; // restart animation
  cartCountEl.classList.add("bump");
}

// delegate add-to-cart clicks (menu grids)
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-btn");
  if(addBtn){
    const id = addBtn.dataset.id;
    addToCart(id);
    addBtn.textContent = "Added ✓";
    addBtn.classList.add("added");
    showToast("Added to your order");
    setTimeout(() => {
      addBtn.textContent = "Add +";
      addBtn.classList.remove("added");
    }, 900);
  }

  const qtyBtn = e.target.closest(".qty-btn");
  if(qtyBtn){
    const id = qtyBtn.dataset.id;
    const delta = qtyBtn.dataset.action === "inc" ? 1 : -1;
    changeQty(id, delta);
  }
});

// ================= CART DRAWER =================
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

function openDrawer(){
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
}
function closeDrawer(){
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("cartToggle").addEventListener("click", openDrawer);
document.getElementById("footerOrderBtn").addEventListener("click", (e) => {
  e.preventDefault();
  openDrawer();
});
document.getElementById("drawerClose").addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);

// show/hide delivery address field based on mode
const modeSelect = document.querySelector('select[name="mode"]');
const addressLabel = document.getElementById("addressLabel");
modeSelect.addEventListener("change", () => {
  addressLabel.style.display = modeSelect.value === "Delivery" ? "flex" : "none";
});

// ================= CHECKOUT -> WHATSAPP =================
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if(cartTotalCount() === 0){
    showToast("Add at least one item first");
    return;
  }

  const form = new FormData(e.target);
  const name = form.get("name");
  const phone = form.get("phone");
  const mode = form.get("mode");
  const address = form.get("address");

  const lines = Object.entries(cart).map(([id, qty]) => {
    const item = ALL_ITEMS.find(i => i.id === id);
    return `• ${item.name} x${qty} — ₦${(item.price*qty).toLocaleString()}`;
  });

  let message = `Hi Jujes Stores! I'd like to place an order:\n\n`;
  message += lines.join("\n");
  message += `\n\nTotal: ₦${cartTotalPrice().toLocaleString()}`;
  message += `\n\nName: ${name}`;
  message += `\nPhone: ${phone}`;
  message += `\nMode: ${mode}`;
  if(mode === "Delivery" && address) message += `\nAddress: ${address}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  showToast("Opening WhatsApp with your order…");
});

// ================= TOAST =================
let toastTimer;
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ================= SCROLL ANIMATIONS =================
const revealTargets = document.querySelectorAll(".reveal, .food-card");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// observe after grids are rendered
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
document.querySelectorAll(".food-card").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  observer.observe(el);
});

// ================= NAV SHRINK ON SCROLL =================
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 30);
});

// ================= FOOTER YEAR =================
document.getElementById("year").textContent = new Date().getFullYear();

// initial render
renderCart();