
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'mi_tienda_cart_v1';

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatCurrency(n) {
    return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function parsePrice(text) {
    if (!text) return 0;
    // Remove non-digits
    const digits = text.replace(/[^0-9]/g, '');
    return parseInt(digits || '0', 10);
  }

  function updateBadge() {
    const badge = document.getElementById('contador');
    if (!badge) return;
    const cart = getCart();
    const qty = cart.reduce((s, it) => s + (it.quantity || 1), 0);
    badge.textContent = qty;
  }

  function addItem(item) {
    const cart = getCart();
    const existing = cart.find((c) => c.name === item.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      item.quantity = 1;
      cart.push(item);
    }
    saveCart(cart);
    updateBadge();
  }

  function removeItem(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
      updateBadge();
      renderCartPage();
    }
  }

  function renderCartPage() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('total');
    if (!list) return;
    const cart = getCart();
    list.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';

      const left = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = item.name;
      left.appendChild(title);
      if (item.options) {
        const opt = document.createElement('div');
        opt.className = 'text-muted small';
        opt.textContent = item.options;
        left.appendChild(opt);
      }

      const right = document.createElement('div');
      right.className = 'd-flex gap-3 align-items-center';
      const priceSpan = document.createElement('span');
      const line = (item.price || 0) * (item.quantity || 1);
      priceSpan.textContent = formatCurrency(line);
      total += line;

      const qty = document.createElement('span');
      qty.className = 'badge bg-secondary';
      qty.textContent = 'x' + (item.quantity || 1);

      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-danger';
      btn.textContent = 'Eliminar';
      btn.addEventListener('click', () => removeItem(idx));

      right.appendChild(qty);
      right.appendChild(priceSpan);
      right.appendChild(btn);

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
    if (totalEl) totalEl.textContent = formatCurrency(total);
  }

  // Attach handlers to "Agregar" buttons (works on index/product pages)
  document.querySelectorAll('.agregar-carrito').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const nameEl = card.querySelector('h5');
      const priceEl = card.querySelector('.card-text');
      const imgEl = card.querySelector('img');
      const name = nameEl ? nameEl.textContent.trim() : 'Producto';
      const price = priceEl ? parsePrice(priceEl.textContent) : 0;
      const options = null;
      const item = { name, price, options };
      addItem(item);
    });
  });

  // If on carrito page, render items
  renderCartPage();
  updateBadge();
});