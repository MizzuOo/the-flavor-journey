/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  const container = document.getElementById("menu-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const subcategoryId = params.get("subcategory"); // ❗ NOT Number()

  let query = db.from("products").select("*");

  // 👉 filter ONLY if exists
  if (subcategoryId) {
    query = query.eq("subcategories_id", subcategoryId);
  }

  const { data, error } = await query;

  console.log("data:", data, "error:", error);

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "No products found";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <div class="img-box">
        <img src="${item.image_url}" />
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p class="price">${item.price} MMK</p>
        <button class="add-btn">🛒 Add to Cart</button>
      </div>
    `;

    card.querySelector(".add-btn")
      .addEventListener("click", () => addToCart(item));

    container.appendChild(card);
  });
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();
});