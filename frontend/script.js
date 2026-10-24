// Global State Variables
let products = [];
let cart = [];
let selectedCategoryId = 0;
let currentSearchKeyword = "";

// Check logged in user state on page load
function checkUserAuth() {
    const savedUser = localStorage.getItem("sanobazar_user");
    const loginBtn = document.getElementById("nav-login-btn");
    const registerBtn = document.getElementById("nav-register-btn");
    const logoutBtn = document.getElementById("nav-logout-btn");

    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (logoutBtn) {
            logoutBtn.style.display = "inline";
            logoutBtn.textContent = `Logout (${user.full_name})`;
        }
    }
}

function userLogout() {
    localStorage.removeItem("sanobazar_user");
    window.location.reload();
}

// Fetch Categories from MySQL
function fetchCategories() {
    fetch("http://localhost/SANOBAZAR/backend/get_categories.php")
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const categoryList = document.getElementById("category-list");
                
                data.data.forEach(cat => {
                    categoryList.innerHTML += `
                        <li class="category-item" onclick="filterByCategory(${cat.id}, this, '${cat.category_name}')">
                            <span>${cat.category_name}</span>
                        </li>
                    `;
                });
            }
        })
        .catch(err => console.error("Error fetching categories:", err));
}

// Fetch Products from MySQL (with optional category and search filters)
function fetchProducts() {
    let url = `http://localhost/SANOBAZAR/backend/get_products.php?category_id=${selectedCategoryId}&q=${encodeURIComponent(currentSearchKeyword)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                products = data.data;
                renderProducts();
            } else {
                console.error("Failed to load products:", data.message);
            }
        })
        .catch(error => console.error("Error fetching products:", error));
}

// Filter Products by Category Click
function filterByCategory(categoryId, element, categoryName = "All Products") {
    selectedCategoryId = categoryId;

    // Update Active UI State
    document.querySelectorAll(".category-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");

    // Update Title
    document.getElementById("current-category-title").textContent = categoryName;

    fetchProducts();
}

// Handle Search Form Submission
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    currentSearchKeyword = searchInput.value.trim();

    document.getElementById("current-category-title").textContent = 
        currentSearchKeyword ? `Search Results for "${currentSearchKeyword}"` : "All Products";

    fetchProducts();
}

// Render Products Catalog
function renderProducts() {
    const productContainer = document.getElementById("product-list");
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `
            <div class="empty-products-msg">
                🔍 No products found matching your search/category selection.
            </div>
        `;
        return;
    }

    for (let i = 0; i < products.length; i++) {
        productContainer.innerHTML += `
            <div class="product-card">
                <img src="${products[i].image_url}" alt="${products[i].name}" class="product-img">
                <h3>${products[i].name}</h3>
                <p class="product-price">Price: NPR ${products[i].price}</p>
                <p class="product-category">Category: ${products[i].category}</p>
                <p style="font-size: 13px; color: ${products[i].stock_quantity < 5 ? '#e74c3c' : '#27ae60'}; font-weight: bold; margin-bottom: 10px;">
                    Stock: ${products[i].stock_quantity} units
                </p>
                <button type="button" onclick="addToCart('${products[i].name}')">Add to Cart</button>
            </div>
        `;
    }
}

// Cart Logic Functions
function addToCart(productName) {
    let existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        let productDetails = products.find(item => item.name === productName);
        cart.push({
            id: productDetails.id,
            name: productDetails.name,
            price: Number(productDetails.price),
            quantity: 1
        });
    }

    displayCart();
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    displayCart();
}

function decreaseQuantity(index) {
    cart[index].quantity -= 1;
    if (cart[index].quantity === 0) {
        cart.splice(index, 1);
    }
    displayCart();
}

function displayCart() {
    const cartList = document.getElementById("cart-list");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    cartList.innerHTML = "";
    let grandTotal = 0;

    if (cart.length === 0) {
        cartList.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
        if (checkoutBtn) checkoutBtn.style.display = "none";
    } else {
        if (checkoutBtn) checkoutBtn.style.display = "block";

        for (let i = 0; i < cart.length; i++) {
            let itemSubtotal = cart[i].price * cart[i].quantity;
            grandTotal += itemSubtotal;

            cartList.innerHTML += `
                <div class="cart-item">
                    <div class="cart-details">
                        <h4>${cart[i].name}</h4>
                        <p>NPR ${cart[i].price} x ${cart[i].quantity} = <strong>NPR ${itemSubtotal}</strong></p>
                    </div>

                    <div class="qty-btn-group">
                        <button class="qty-btn" onclick="decreaseQuantity(${i})">-</button>
                        <span class="qty-count">${cart[i].quantity}</span>
                        <button class="qty-btn" onclick="increaseQuantity(${i})">+</button>
                    </div>
                </div>
            `;
        }
    }

    cartTotal.textContent = "Grand Total: NPR " + grandTotal;
}

function placeOrder() {
    if (cart.length === 0) return;

    const savedUser = localStorage.getItem("sanobazar_user");
    if (!savedUser) {
        alert("🔒 Please login or create an account to complete your order.");
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(savedUser);

    fetch("http://localhost/SANOBAZAR/backend/place_order.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart, user_id: currentUser.id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("🎉 " + data.message + "\nOrder ID: #" + data.order_id);
            cart = [];
            displayCart();
            fetchProducts();
        } else {
            alert("❌ Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Checkout Error:", error);
        alert("Failed to connect to checkout server.");
    });
}

// Initialization on Page Load
checkUserAuth();
fetchCategories();
fetchProducts();