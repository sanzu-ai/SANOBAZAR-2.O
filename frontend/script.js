// Step 1: Initialize empty array for Products and Cart
let products = [];
let cart = [];

// Step 2: Fetch products from PHP API
function fetchProducts() {
    fetch("http://localhost/SANOBAZAR/backend/get_products.php")
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                products = data.data; // Fill products array with data from MySQL
                renderProducts();    // Render cards on webpage
            } else {
                console.error("Failed to load products:", data.message);
            }
        })
        .catch(error => console.error("Error fetching products:", error));
}

// Step 3: Render Product Cards onto webpage
function renderProducts() {
    const productContainer = document.getElementById("product-list");
    productContainer.innerHTML = "";

    for (let i = 0; i < products.length; i++) {
        productContainer.innerHTML += `
            <div class="product-card">
                <img src="${products[i].image_url}" alt="${products[i].name}" class="product-img">
                <h3>${products[i].name}</h3>
                <p class="product-price">Price: NPR ${products[i].price}</p>
                <p class="product-category">Category: ${products[i].category}</p>
                <button type="button" onclick="addToCart('${products[i].name}')">Add to Cart</button>
            </div>
        `;
    }
}

// Step 4: Add to Cart (Includes product ID)
function addToCart(productName) {
    let existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        let productDetails = products.find(item => item.name === productName);
        cart.push({
            id: productDetails.id, // Stores database ID!
            name: productDetails.name,
            price: Number(productDetails.price),
            quantity: 1
        });
    }

    displayCart();
}

// Step 5: Increase Item Quantity (+)
function increaseQuantity(index) {
    cart[index].quantity += 1;
    displayCart();
}

// Step 6: Decrease Item Quantity (-) and Auto-remove at 0
function decreaseQuantity(index) {
    cart[index].quantity -= 1;

    if (cart[index].quantity === 0) {
        cart.splice(index, 1);
    }

    displayCart();
}

// Step 7: Render Cart and Calculate Totals
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

// Step 8: Call fetchProducts() on initial page load
fetchProducts();

// Step 9: Place Order Function (Integrates Logged-in User)
function placeOrder() {
    if (cart.length === 0) return;

    // Check if user is logged in
    const savedUser = localStorage.getItem("sanobazar_user");
    if (!savedUser) {
        alert("🔒 Please login or create an account to complete your order.");
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(savedUser);

    fetch("http://localhost/SANOBAZAR/backend/place_order.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            cart: cart,
            user_id: currentUser.id  // Sends actual logged-in user ID!
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("🎉 " + data.message + "\nOrder ID: #" + data.order_id);
            cart = []; // Clear cart
            displayCart();
            fetchProducts(); // Refresh live stock on page
        } else {
            alert("❌ Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Checkout Error:", error);
        alert("Failed to connect to checkout server.");
    });
}