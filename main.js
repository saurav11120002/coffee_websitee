let userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

// Check if userId is available and fetch cart items
if (userId) {
    loadCartItems();
}

// Cart functionality selectors
let cartIcon = document.querySelector('#cart-icon');
let cart = document.querySelector('.cart');
let closeCart = document.querySelector('#close-cart');

// Open the cart and load cart items
cartIcon.onclick = () => {
    cart.classList.add("active");
    loadCartItems(); // Load cart items from the server when the cart is opened
};

// Close the cart
closeCart.onclick = () => {
    cart.classList.remove("active");
};

// Add event listener for search input
document.getElementById('search-input').addEventListener('input', searchProducts);

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const productBoxes = document.getElementsByClassName('product-box');
    
    for (let i = 0; i < productBoxes.length; i++) {
        const productTitle = productBoxes[i].getElementsByClassName('product-title')[0].innerText.toLowerCase();
        
        // If product title matches the search term, display it; otherwise, hide it
        if (productTitle.includes(searchTerm)) {
            productBoxes[i].style.display = '';
        } else {
            productBoxes[i].style.display = 'none';
        }
    }
}

// Handle login and signup to store userId
function loginUser(phone, password) {
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const userId = data.userId;
        console.log('Logged in user ID:', userId);
        loadCartItems();
    })
    .catch(error => console.error('Login error:', error));
}

function signupUser(phone, password) {
    fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    })
    .then(() => {
        console.log('Signup successful');
        loginUser(phone, password); // Automatically log in after signup
    })
    .catch(error => console.error('Signup error:', error));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    loadCartItems();

    var removeCartButtons = document.getElementsByClassName("cart-remove");
    for (var i = 0; i < removeCartButtons.length; i++) {
        var button = removeCartButtons[i];
        button.addEventListener("click", removeCartItem);
    }

    var quantityInputs = document.getElementsByClassName("cart-quantity");
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener("change", quantityChanged);
    }

    var addCartButtons = document.getElementsByClassName("add-cart");
    for (var i = 0; i < addCartButtons.length; i++) {
        var button = addCartButtons[i];
        button.addEventListener("click", addCartClicked);
    }

    updateTotal();
    updateCartIcon();
}

function loadCartItems() {
    if (!userId) return;
    
    fetch(`http://localhost:3000/cart-items/${userId}`)
    .then(response => response.json())
    .then(items => {
        var cartItems = document.getElementsByClassName('cart-content')[0];
        cartItems.innerHTML = '';

        if (items.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            items.forEach(item => {
                addProductToCart(item.title, item.price, item.product_img, item.id, item.quantity);
            });
        }
        updateTotal();
        updateCartIcon();
    })
    .catch(error => console.error('Error loading cart items:', error));
}

function addCartClicked(event) {
    if (!userId) {
        alert('Please log in first!');
        return;
    }

    var button = event.target;
    var shopProducts = button.parentElement;
    var title = shopProducts.getElementsByClassName('product-title')[0].innerText;
    var price = shopProducts.getElementsByClassName('price')[0].innerText;
    var productImg = shopProducts.getElementsByClassName('product-img')[0].src;

    const cartItem = {
        userId,
        title,
        price: parseFloat(price),
        productImg,
        quantity: 1
    };

    fetch('http://localhost:3000/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItem)
    })
    .then(() => {
        loadCartItems();
    })
    .catch(error => console.error('Error adding item to cart:', error));
}

function addProductToCart(title, price, productImg, itemId, quantity = 1) {
    var cartShopBox = document.createElement('div');
    cartShopBox.classList.add('cart-box');
    var cartItems = document.getElementsByClassName('cart-content')[0];

    price = parseFloat(price);

    if (isNaN(price)) {
        price = 0;
    }

    var cartBoxContent = `
        <img src="${productImg}" class="cart-img" />
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price.toFixed(2)}</div>
            <input type="number" value="${quantity}" class="cart-quantity" data-id="${itemId}" min="1">
        </div>
        <i class='bx bxs-trash-alt cart-remove' data-id="${itemId}"></i>
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.appendChild(cartShopBox);

    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener("click", removeCartItem);
    cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener("change", quantityChanged);
}

function removeCartItem(event) {
    var buttonClicked = event.target;
    var itemId = buttonClicked.dataset.id;

    fetch(`http://localhost:3000/cart-items/${itemId}`, { method: 'DELETE' })
    .then(() => {
        buttonClicked.parentElement.remove();
        updateTotal();
        updateCartIcon();
    })
    .catch(error => console.error('Error removing cart item:', error));
}

function quantityChanged(event) {
    var input = event.target;
    var itemId = input.dataset.id;
    var quantity = parseInt(input.value);

    if (quantity < 1) {
        quantity = 1;
    }

    fetch(`http://localhost:3000/cart-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
    })
    .then(() => {
        updateTotal();
    })
    .catch(error => console.error('Error updating quantity:', error));
}

function updateTotal() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartBoxes = cartContent.getElementsByClassName("cart-box");
    var total = 0;

    for (var i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var priceElement = cartBox.getElementsByClassName("cart-price")[0];
        var quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];

        var price = parseFloat(priceElement.innerText);
        var quantity = quantityElement.value;

        total += price * quantity;
    }

    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('total-price')[0].innerText = total.toFixed(2);
}

function updateCartIcon() {
    var cartItems = document.getElementsByClassName('cart-box').length;
    cartIcon.setAttribute('data-quantity', cartItems);
}
