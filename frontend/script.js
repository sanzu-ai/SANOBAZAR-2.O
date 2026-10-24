let products = [];
let cart = [];
let selectedCategoryId = 0;
let currentSearchKeyword = "";

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

function fetchCategories() {
    fetch("http://localhost/SANOBAZAR/backend/get_categories.php")
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const categoryList = document.getElementById("category-list");
                
                data.data.forEach(cat => {
                    categoryList.innerHTML += `
                        <li class="category-item" onclick="filterByCategory(${cat.id}, this, '${cat.category_name}')">
                            ${cat.category_name}
                        </li>
                    `;
                });
            }
        })
        .catch(err => console.error("Error fetching categories:", err));
}

function fetchProducts() {
    let url = `http://localhost/SANOBAZAR/backend/get_products.php?category_id=${selectedCategoryId}&q=${encodeURIComponent(currentSearchKeyword)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                products = data.data;
                renderProducts();
            }
        })
        .catch(error => console.error("Error fetching products:", error));
}

function filterByCategory(categoryId, element, categoryName = "All Products") {
    selectedCategoryId = categoryId;
    document.querySelectorAll(".category-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    document.getElementById("current-category-title").textContent = categoryName;
    fetchProducts();
}

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    currentSearchKeyword = searchInput.value.trim();
    document.getElementById("current-category-title").textContent = 
        currentSearchKeyword ? `Search Results for "${currentSearchKeyword}"` : "All Products";
    fetchProducts();
}

function renderProducts() {
    const productContainer = document.getElementById("product-list");
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `<div class="empty-products-msg">🔍 No products found matching your search/category.</div>`;
        return;
    }

    products.forEach(item => {
        const isLowStock = item.stock_quantity < 5;
        productContainer.innerHTML += `
            <div class="product-card">
                <img src="${item.image_url}" alt="${item.name}" class="product-img">
                <h3>${item.name}</h3>
                <p class="product-price">NPR ${item.price}</p>
                <p class="product-category">Category: ${item.category}</p>
                <p class="stock-tag ${isLowStock ? 'stock-low' : 'stock-normal'}">
                    Stock: ${item.stock_quantity} units
                </p>
                <button type="button" onclick="addToCart('${item.name}')">Add to Cart</button>
            </div>
        `;
    });
}

function fetchRecommendations() {
    fetch("http://localhost/SANOBAZAR/backend/get_recommendations.php")
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const recContainer = document.getElementById("recommendations-list");
                recContainer.innerHTML = "";

                data.data.forEach(item => {
                    recContainer.innerHTML += `
                        <div class="product-card">
                            <img src="${item.image_url}" alt="${item.name}" class="product-img">
                            <h3>${item.name}</h3>
                            <p class="product-price">NPR ${item.price}</p>
                            <p class="product-category">Category: ${item.category}</p>
                            <button type="button" onclick="addToCart('${item.name}')">Add to Cart</button>
                        </div>
                    `;
                });
            }
        })
        .catch(err => console.error("Error loading recommendations:", err));
}

function addToCart(productName) {
    let existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        let productDetails = products.find(item => item.name === productName);
        if (!productDetails) return;
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
            fetchRecommendations();
        } else {
            alert("❌ Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Checkout Error:", error);
        alert("Failed to connect to checkout server.");
    });
}

// Initial Calls
checkUserAuth();
fetchCategories();
fetchProducts();
fetchRecommendations();