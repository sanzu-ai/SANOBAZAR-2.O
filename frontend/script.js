// 1. Products list
let products = [
    { 
        name: "Laptop", 
        price: 65000, 
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" 
    },
    { 
        name: "Wireless Headphones", 
        price: 2500, 
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" 
    },
    { 
        name: "Gaming Keyboard", 
        price: 3500, 
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" 
    },
    { 
        name: "Smart Watch", 
        price: 4500, 
        category: "Wearables",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" 
    },
    { 
        name: "Bluetooth Speaker", 
        price: 3000, 
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" 
    }
];

// 2. Shopping cart array (stores objects: { name, price, quantity })
let cart = [];

// 3. Add to Cart (Increases quantity if already exists)
function addToCart(productName) {
    // Check if item is already in cart
    let existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        let productDetails = products.find(item => item.name === productName);
        cart.push({
            name: productDetails.name,
            price: productDetails.price,
            quantity: 1
        });
    }

    displayCart();
}

// 4. Increase Quantity (+)
function increaseQuantity(index) {
    cart[index].quantity += 1;
    displayCart();
}

// 5. Decrease Quantity (-) & Remove if quantity reaches 0
function decreaseQuantity(index) {
    cart[index].quantity -= 1;

    if (cart[index].quantity === 0) {
        cart.splice(index, 1); // Removes item from cart
    }

    displayCart();
}

// 6. Display Cart and Calculate Grand Total
function displayCart() {
    const cartList = document.getElementById("cart-list");
    const cartTotal = document.getElementById("cart-total");

    cartList.innerHTML = "";

    let grandTotal = 0;

    if (cart.length === 0) {
        cartList.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
    } else {
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

// 7. Render Product Cards on page load
const productContainer = document.getElementById("product-list");
productContainer.innerHTML = "";

for (let i = 0; i < products.length; i++) {
    productContainer.innerHTML += `
        <div class="product-card">
            <img src="${products[i].image}" alt="${products[i].name}" class="product-img">
            <h3>${products[i].name}</h3>
            <p class="product-price">Price: NPR ${products[i].price}</p>
            <p class="product-category">Category: ${products[i].category}</p>
            <button type="button" onclick="addToCart('${products[i].name}')">Add to Cart</button>
        </div>
    `;
}