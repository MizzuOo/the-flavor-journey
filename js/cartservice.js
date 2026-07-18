
/* ================= GET USER ================= */
async function getUser() {
  const {
    data: { user }
  } = await db.auth.getUser();

  return user;
}

/* ================= REQUIRE LOGIN ================= */
async function requireLogin() {
  const user = await getUser();

  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return null;
  }

  return user;
}

/* ================= ADD TO CART ================= */
async function addToCart(product) {
  const user = await requireLogin();
  if (!user) return;

  const { data: existing, error: findError } = await db
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle();

  if (findError) {
    console.error(findError.message);
    return;
  }

  if (existing) {
    await db
      .from("cart_items")
      .update({
        quantity: existing.quantity + 1
      })
      .eq("id", existing.id);
  } else {
    await db.from("cart_items").insert([
      {
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        quantity: 1
      }
    ]);
  }

  await updateCartCount();
  showToast(`${product.name} added to cart`);
}

/* ================= GET CART ================= */
async function getCart() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await db
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
    return [];
  }

  return data || [];
}

/* ================= UPDATE CART COUNT ================= */
async function updateCartCount() {
  const cart = await getCart();

  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalQty;
}

/* ================= CHANGE QTY ================= */
async function changeQty(id, change) {
  const { data: item, error } = await db
    .from("cart_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) return;

  const newQty = item.quantity + change;

  if (newQty <= 0) {
    await db.from("cart_items").delete().eq("id", id);
  } else {
    await db
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", id);
  }

  await renderCart();
  await updateCartCount();
}

/* ================= REMOVE ITEM ================= */
async function removeItem(id) {
  await db.from("cart_items").delete().eq("id", id);

  await renderCart();
  await updateCartCount();
}

/* ================= RENDER CART ================= */
async function renderCart() {
  const user = await getUser();
  if (!user) return;

  const cart = await getCart();

  const body = document.getElementById("cart-body");
  const totalEl = document.getElementById("final-total");

  if (!body || !totalEl) return;

  body.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    const rowTotal = item.price * item.quantity;
    total += rowTotal;

    body.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.price.toLocaleString()} MMK</td>
        <td>
          <button onclick="changeQty('${item.id}', -1)">-</button>
          ${item.quantity}
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </td>
        <td>${rowTotal.toLocaleString()} MMK</td>
        <td>
          <button onclick="removeItem('${item.id}')">Remove</button>
        </td>
      </tr>
    `;
  });

  totalEl.textContent = "Total: " + total.toLocaleString() + " MMK";
}

/* ================= TOAST ================= */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ================= GLOBAL EXPORT ================= */
window.addToCart = addToCart;
window.getCart = getCart;
window.updateCartCount = updateCartCount;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.renderCart = renderCart;
window.showToast = showToast;
window.getUser = getUser;
window.requireLogin = requireLogin;