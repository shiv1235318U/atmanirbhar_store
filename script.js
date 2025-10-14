// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateCartUI();
    setupEventListeners();
    setupPaymentListeners();
}

// Setup all event listeners
function setupEventListeners() {
    // Explore button
    document.getElementById('exploreBtn').addEventListener('click', function() {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });

    // Explore professions button
    document.getElementById('exploreProfessions').addEventListener('click', function() {
        document.getElementById('profession').scrollIntoView({ behavior: 'smooth' });
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', function() {
        openPanel('cartPanel');
    });

    // Contact form - Formspree integration with AJAX
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.btn-send');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Use AJAX to submit to Formspree
        const formData = new FormData(this);
        
        fetch('https://formspree.io/f/mblzpnqp', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                showNotification('Thank you! Your message has been sent successfully.');
                this.reset();
            } else {
                showNotification('There was a problem sending your message. Please try again.');
            }
        })
        .catch(error => {
            showNotification('There was a problem sending your message. Please try again.');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });

    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        const nav = document.querySelector('nav ul');
        nav.classList.toggle('show');
    });

    // Buy Now buttons for main products
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                openPanel(panelId);
            }
        });
    });

    // Product overlay buttons
    document.querySelectorAll('.btn-overlay').forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                openPanel(panelId);
            }
        });
    });

    // Product items in slide panels
    document.querySelectorAll('.product-item[data-subslide]').forEach(item => {
        item.addEventListener('click', function() {
            const subslideId = this.getAttribute('data-subslide');
            if (subslideId) {
                openPanel(subslideId);
            }
        });
    });

    // Hire buttons for professions
    document.querySelectorAll('.btn-hire').forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                openPanel(panelId);
            }
        });
    });

    // Close buttons
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function() {
            const panel = this.closest('.slide-panel');
            if (panel) {
                closePanel(panel.id);
            }
        });
    });

    // Close panels when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('slide-panel')) {
            closePanel(e.target.id);
        }
    });
}

// Setup payment method listeners
function setupPaymentListeners() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updatePaymentForm(this.value);
        });
    });
}

// Update payment form based on selected method
function updatePaymentForm(method) {
    // Hide all forms first
    document.getElementById('cardForm').style.display = 'none';
    document.getElementById('upiForm').style.display = 'none';
    document.getElementById('codMessage').style.display = 'none';
    
    // Show relevant form based on selected method
    switch(method) {
        case 'card':
            document.getElementById('cardForm').style.display = 'block';
            break;
        case 'upi':
            document.getElementById('upiForm').style.display = 'block';
            break;
        case 'cod':
            document.getElementById('codMessage').style.display = 'block';
            break;
    }
}

// Panel functions
function openPanel(panelId) {
    // Close all panels first
    closeAllPanels();
    
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

function closeAllPanels() {
    document.querySelectorAll('.slide-panel').forEach(panel => {
        panel.classList.remove('open');
    });
    document.body.style.overflow = 'auto';
}

// Cart functions
function addToCart(product) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    // Update storage and UI
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
    
    // Close current sub-slide panel
    const currentSubSlide = document.querySelector('.sub-slide.open');
    if (currentSubSlide) {
        closePanel(currentSubSlide.id);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Item removed from cart');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
    showNotification('Cart cleared');
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    const cartIndicator = document.getElementById('cartIndicator');

    // Update cart count - This shows item count even when cart is closed (standard e-commerce behavior)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    // Show/hide cart indicator based on item count
    if (cartIndicator) {
        if (totalItems > 0) {
            cartIndicator.style.display = 'flex';
        } else {
            cartIndicator.style.display = 'none';
        }
    }

    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '0';
            return;
        }

        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">₹${itemTotal}</div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        if (cartTotal) cartTotal.textContent = total;
    }
}

// Professional contact function
function contactProfessional(name, phone) {
    showNotification(`Contacting ${name} at ${phone}...`);
    // In a real application, this would initiate a call or open a chat
    setTimeout(() => {
        showNotification(`${name} has been notified and will contact you shortly!`);
    }, 1500);
}

// Payment functions
function proceedToPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Update payment items
    const paymentItems = document.getElementById('paymentItems');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (paymentItems) {
        paymentItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const paymentItem = document.createElement('div');
            paymentItem.className = 'cart-item';
            paymentItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="cart-item-total">₹${itemTotal}</div>
            `;
            
            paymentItems.appendChild(paymentItem);
        });
        
        if (paymentTotal) paymentTotal.textContent = total;
    }
    
    // Reset payment method to COD by default
    document.getElementById('cod').checked = true;
    updatePaymentForm('cod');
    
    // Open payment panel
    closePanel('cartPanel');
    openPanel('paymentPanel');
}

function processPayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate based on payment method
    let isValid = true;
    let message = '';
    
    switch(selectedPayment) {
        case 'card':
            const cardNumber = document.getElementById('cardNumber').value;
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            const name = document.getElementById('name').value;
            
            if (!cardNumber || !expiry || !cvv || !name) {
                isValid = false;
                message = 'Please fill all card details';
            } else if (cardNumber.replace(/\s/g, '').length !== 16) {
                isValid = false;
                message = 'Please enter a valid 16-digit card number';
            }
            break;
            
        case 'upi':
            const upiId = document.getElementById('upiId').value;
            if (!upiId) {
                isValid = false;
                message = 'Please enter your UPI ID';
            } else if (!upiId.includes('@')) {
                isValid = false;
                message = 'Please enter a valid UPI ID';
            }
            break;
            
        case 'cod':
            // No validation needed for COD
            isValid = true;
            break;
    }
    
    if (!isValid) {
        showNotification(message);
        return;
    }
    
    // Simulate payment processing
    showNotification('Processing your order...');
    
    setTimeout(() => {
        // Clear cart after successful order
        const orderNumber = 'ORD' + Date.now().toString().slice(-6);
        
        // Clear cart
        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();
        
        // Close payment panel
        closePanel('paymentPanel');
        
        // Show success message with order number
        showNotification(`Order successful! Your order number is ${orderNumber}. Thank you!`);
        
        // Reset all forms
        resetPaymentForms();
    }, 2000);
}

function resetPaymentForms() {
    // Reset card form
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiry').value = '';
    document.getElementById('cvv').value = '';
    document.getElementById('name').value = '';
    
    // Reset UPI form
    document.getElementById('upiId').value = '';
    
    // Reset to COD
    document.getElementById('cod').checked = true;
    updatePaymentForm('cod');
}

// Notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize cart UI on load
updateCartUI();
