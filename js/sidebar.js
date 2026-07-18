/* ================= SIDEBAR RENDER (LEVEL 5) ================= */

function getSession() {
    return JSON.parse(localStorage.getItem("sessionUser"));
}

function renderSidebar() {

    const session = getSession();
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    /* ================= NOT LOGGED IN ================= */
    if (!session) {
        sidebar.innerHTML = `
            <h2>🍽 Food System</h2>

            <a href="../user/login.html">🔐 Login</a>
            <a href="../user/register.html">📝 Register</a>
        `;
        return;
    }

    /* ================= USER SIDEBAR ================= */
    if (session.role === "user") {
        sidebar.innerHTML = `
            <h2>🍽 User Panel</h2>

            <a href="../user/index.html">🏠 Home</a>
            <a href="../user/menu.html">🍔 Menu</a>
            <a href="../user/categories.html">📂 Categories</a>
            <a href="../user/cart.html">🛒 Cart</a>
            <a href="../user/order-history.html">📦 Orders</a>
            <a href="../user/about.html">ℹ️ About</a>

            <hr>

            <a href="#" onclick="logout()">🚪 Logout</a>
        `;
    }

    /* ================= ADMIN SIDEBAR ================= */
    if (session.role === "admin") {
        sidebar.innerHTML = `
            <h2>🛠 Admin Panel</h2>

            <a href="../admin/dashboard.html">📊 Dashboard</a>
            <a href="../admin/products.html">🍔 Products</a>
            <a href="../admin/orders.html">📦 Orders</a>
            <a href="../admin/users.html">👥 Users</a>

            <hr>

            <a href="../user/index.html">🏠 Back to Site</a>
            <a href="#" onclick="logout()">🚪 Logout</a>
        `;
    }

    /* ================= ACTIVE LINK HIGHLIGHT ================= */
    highlightActiveLink();
}

/* ================= ACTIVE PAGE HIGHLIGHT ================= */
function highlightActiveLink() {

    const links = document.querySelectorAll("#sidebar a");

    links.forEach(link => {

        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
}

/* ================= AUTO RUN ================= */
document.addEventListener("DOMContentLoaded", renderSidebar);