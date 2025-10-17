// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hire Data
let hires = JSON.parse(localStorage.getItem('hires')) || [];

// Orders Data
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Track viewed states
let viewedStates = JSON.parse(localStorage.getItem('viewedStates')) || {
    cartViewed: true,
    hiresViewed: true,
    ordersViewed: true
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateCartUI();
    updateHireUI();
    updateOrdersUI();
    setupEventListeners();
    setupPaymentListeners();
    setupHirePaymentListeners();
    updateNotificationIndicators();
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
        collapseFloatingButtons();
        markAsViewed('cart');
    });

    // Hire button
    document.getElementById('hireBtn').addEventListener('click', function() {
        openPanel('hirePanel');
        collapseFloatingButtons();
        markAsViewed('hires');
    });

    // Orders button
    document.getElementById('ordersBtn').addEventListener('click', function() {
        openPanel('ordersPanel');
        collapseFloatingButtons();
        markAsViewed('orders');
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
                collapseFloatingButtons();
            }
        });
    });

    // Product overlay buttons
    document.querySelectorAll('.btn-overlay').forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                openPanel(panelId);
                collapseFloatingButtons();
            }
        });
    });

    // Product items in slide panels
    document.querySelectorAll('.product-item[data-subslide]').forEach(item => {
        item.addEventListener('click', function() {
            const subslideId = this.getAttribute('data-subslide');
            if (subslideId) {
                openPanel(subslideId);
                collapseFloatingButtons();
            }
        });
    });

    // Hire buttons for professions
    document.querySelectorAll('.btn-hire').forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                openPanel(panelId);
                collapseFloatingButtons();
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

    // Use event delegation for dynamically created rate buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-rate') || e.target.closest('.btn-rate')) {
            const button = e.target.classList.contains('btn-rate') ? e.target : e.target.closest('.btn-rate');
            const professionalId = button.getAttribute('data-professional-id');
            if (professionalId) {
                openRatingPanel(professionalId);
            }
        }
    });
}

// Mark panel as viewed and hide notification
function markAsViewed(panelType) {
    switch(panelType) {
        case 'cart':
            viewedStates.cartViewed = true;
            break;
        case 'hires':
            viewedStates.hiresViewed = true;
            break;
        case 'orders':
            viewedStates.ordersViewed = true;
            break;
    }
    localStorage.setItem('viewedStates', JSON.stringify(viewedStates));
    updateNotificationIndicators();
}

// Reset notifications when new items are added
function resetNotifications(panelType) {
    switch(panelType) {
        case 'cart':
            viewedStates.cartViewed = false;
            break;
        case 'hires':
            viewedStates.hiresViewed = false;
            break;
        case 'orders':
            viewedStates.ordersViewed = false;
            break;
    }
    localStorage.setItem('viewedStates', JSON.stringify(viewedStates));
    updateNotificationIndicators();
}

// Update notification indicators based on viewed state and item count
function updateNotificationIndicators() {
    const cartCount = document.getElementById('cartIndicator');
    const hireCount = document.getElementById('hireIndicator');
    const ordersCount = document.getElementById('ordersIndicator');

    // Cart notification
    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        if (totalCartItems > 0 && !viewedStates.cartViewed) {
            cartCount.textContent = totalCartItems;
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }

    // Hire notification
    const totalHires = hires.reduce((sum, hire) => sum + hire.days, 0);
    if (hireCount) {
        if (totalHires > 0 && !viewedStates.hiresViewed) {
            hireCount.textContent = totalHires;
            hireCount.style.display = 'flex';
        } else {
            hireCount.style.display = 'none';
        }
    }

    // Orders notification
    if (ordersCount) {
        if (orders.length > 0 && !viewedStates.ordersViewed) {
            ordersCount.textContent = orders.length;
            ordersCount.style.display = 'flex';
        } else {
            ordersCount.style.display = 'none';
        }
    }
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

// Setup hire payment method listeners
function setupHirePaymentListeners() {
    const paymentMethods = document.querySelectorAll('input[name="hirePayment"]');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updateHirePaymentForm(this.value);
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

// Update hire payment form based on selected method
function updateHirePaymentForm(method) {
    // Hide all forms first
    document.getElementById('hireCardForm').style.display = 'none';
    document.getElementById('hireUpiForm').style.display = 'none';
    document.getElementById('hireCodMessage').style.display = 'none';
    
    // Show relevant form based on selected method
    switch(method) {
        case 'card':
            document.getElementById('hireCardForm').style.display = 'block';
            break;
        case 'upi':
            document.getElementById('hireUpiForm').style.display = 'block';
            break;
        case 'cod':
            document.getElementById('hireCodMessage').style.display = 'block';
            break;
    }
}

// Floating buttons collapse/expand functions
function collapseFloatingButtons() {
    const floatingButtons = document.querySelector('.floating-buttons');
    floatingButtons.classList.add('collapsed');
}

function expandFloatingButtons() {
    const floatingButtons = document.querySelector('.floating-buttons');
    floatingButtons.classList.remove('collapsed');
}

// Panel functions
function openPanel(panelId) {
    // Close all panels first
    closeAllPanels();
    
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        collapseFloatingButtons();
    }
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('open');
        
        // Check if all panels are closed
        const openPanels = document.querySelectorAll('.slide-panel.open');
        if (openPanels.length === 0) {
            document.body.style.overflow = 'auto';
            expandFloatingButtons();
        }
    }
}

function closeAllPanels() {
    document.querySelectorAll('.slide-panel').forEach(panel => {
        panel.classList.remove('open');
    });
    document.body.style.overflow = 'auto';
    expandFloatingButtons();
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
    
    // Reset notification for cart
    resetNotifications('cart');
    
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

    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '0';
            // Mark as viewed when cart is empty
            viewedStates.cartViewed = true;
            localStorage.setItem('viewedStates', JSON.stringify(viewedStates));
            updateNotificationIndicators();
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
    
    updateNotificationIndicators();
}

// Hire functions
function hireProfessional(professional) {
    // Check if professional already exists in hires
    const existingHire = hires.find(hire => hire.id === professional.id);
    
    if (existingHire) {
        existingHire.days += 1;
    } else {
        hires.push({
            id: professional.id,
            name: professional.name,
            profession: professional.profession,
            price: professional.price,
            days: 1,
            phone: professional.phone,
            image: professional.image,
            status: 'hired', // hired, completed, rated
            userRating: 0
        });
    }
    
    // Update storage and UI
    localStorage.setItem('hires', JSON.stringify(hires));
    updateHireUI();
    
    // Reset notification for hires
    resetNotifications('hires');
    
    // Show notification
    showNotification(`${professional.name} hired successfully!`);
    
    // Close current sub-slide panel
    const currentSubSlide = document.querySelector('.sub-slide.open');
    if (currentSubSlide) {
        closePanel(currentSubSlide.id);
    }
}

function removeFromHires(professionalId) {
    hires = hires.filter(hire => hire.id !== professionalId);
    localStorage.setItem('hires', JSON.stringify(hires));
    updateHireUI();
    showNotification('Professional removed from hires');
}

function updateHireDays(professionalId, change) {
    const hire = hires.find(hire => hire.id === professionalId);
    if (hire) {
        hire.days += change;
        
        if (hire.days <= 0) {
            removeFromHires(professionalId);
            return;
        }
        
        localStorage.setItem('hires', JSON.stringify(hires));
        updateHireUI();
    }
}

function clearHires() {
    hires = [];
    localStorage.removeItem('hires');
    updateHireUI();
    showNotification('All hires cleared');
}

function updateHireUI() {
    const hireItems = document.getElementById('hireItems');
    const hireTotal = document.getElementById('hireTotal');

    // Update hire items
    if (hireItems) {
        hireItems.innerHTML = '';
        
        if (hires.length === 0) {
            hireItems.innerHTML = '<p class="empty-hire">You haven\'t hired any professionals yet</p>';
            if (hireTotal) hireTotal.textContent = '0';
            // Mark as viewed when no hires
            viewedStates.hiresViewed = true;
            localStorage.setItem('viewedStates', JSON.stringify(viewedStates));
            updateNotificationIndicators();
            return;
        }

        let total = 0;
        
        hires.forEach(hire => {
            const hireTotal = hire.price * hire.days;
            total += hireTotal;
            
            const hireItem = document.createElement('div');
            hireItem.className = 'hire-item';
            
            // Status badge
            let statusBadge = '';
            if (hire.status === 'completed') {
                statusBadge = '<span class="status-badge status-completed">Completed</span>';
            } else if (hire.status === 'rated') {
                statusBadge = '<span class="status-badge status-rated">Rated</span>';
            } else {
                statusBadge = '<span class="status-badge status-hired">Hired</span>';
            }
            
            hireItem.innerHTML = `
                <div class="hire-item-info">
                    <div class="hire-item-image">
                        <img src="${hire.image}" alt="${hire.name}">
                    </div>
                    <div class="hire-item-details">
                        <h4>${hire.name} ${statusBadge}</h4>
                        <p>${hire.profession} - ₹${hire.price}/day × ${hire.days} days</p>
                        <div class="professional-status">
                            ${hire.status === 'hired' ? '<span class="status-connected"><i class="fas fa-circle"></i> Connected</span>' : ''}
                            ${hire.status === 'completed' ? `<button class="btn-rate" data-professional-id="${hire.id}">Rate Experience</button>` : ''}
                        </div>
                    </div>
                </div>
                <div class="hire-item-controls">
                    <button onclick="updateHireDays('${hire.id}', -1)">-</button>
                    <span>${hire.days}</span>
                    <button onclick="updateHireDays('${hire.id}', 1)">+</button>
                    <button class="hire-remove-btn" onclick="removeFromHires('${hire.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="hire-item-total">₹${hireTotal}</div>
            `;
            
            hireItems.appendChild(hireItem);
        });
        
        if (hireTotal) hireTotal.textContent = total;
    }
    
    updateNotificationIndicators();
}

// Orders functions
function addToOrders(orderData) {
    const order = {
        id: 'ORD' + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString('en-IN'),
        items: orderData.items,
        total: orderData.total,
        status: 'pending' // pending, shipped, delivered, cancelled
    };
    
    orders.unshift(order); // Add to beginning of array
    localStorage.setItem('orders', JSON.stringify(orders));
    updateOrdersUI();
    
    // Reset notification for orders
    resetNotifications('orders');
    
    return order.id;
}

function cancelOrder(orderId) {
    const order = orders.find(order => order.id === orderId);
    if (order) {
        order.status = 'cancelled';
        localStorage.setItem('orders', JSON.stringify(orders));
        updateOrdersUI();
        showNotification(`Order #${orderId} has been cancelled successfully!`);
    }
}

function removeOrder(orderId) {
    orders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(orders));
    updateOrdersUI();
    showNotification(`Order #${orderId} has been removed from your history!`);
    
    // If no orders left, close the orders panel
    if (orders.length === 0) {
        setTimeout(() => {
            closePanel('ordersPanel');
        }, 1500);
    }
}

function clearOrderHistory() {
    orders = [];
    localStorage.removeItem('orders');
    updateOrdersUI();
    showNotification('All orders have been removed from your history!');
    closePanel('ordersPanel');
}

function updateOrdersUI() {
    const ordersItems = document.getElementById('ordersItems');

    // Update orders items
    if (ordersItems) {
        ordersItems.innerHTML = '';
        
        if (orders.length === 0) {
            ordersItems.innerHTML = `
                <div class="empty-orders">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 15px;"></i>
                    <p>You haven't placed any orders yet</p>
                    <button class="btn-continue" onclick="closePanel('ordersPanel')">Start Shopping</button>
                </div>
            `;
            // Mark as viewed when no orders
            viewedStates.ordersViewed = true;
            localStorage.setItem('viewedStates', JSON.stringify(viewedStates));
            updateNotificationIndicators();
            return;
        }

        orders.forEach(order => {
            let statusClass = '';
            let statusText = '';
            
            switch(order.status) {
                case 'delivered':
                    statusClass = 'status-delivered';
                    statusText = 'Delivered';
                    break;
                case 'shipped':
                    statusClass = 'status-shipped';
                    statusText = 'Shipped';
                    break;
                case 'cancelled':
                    statusClass = 'status-cancelled';
                    statusText = 'Cancelled';
                    break;
                default:
                    statusClass = 'status-pending';
                    statusText = 'Pending';
            }
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-header">
                    <div>
                        <div class="order-number">Order #${order.id}</div>
                        <div class="order-date">Placed on ${order.date}</div>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-products">
                    ${order.items.map(item => `
                        <div class="order-product">
                            <div class="order-product-info">
                                <h4>${item.name}</h4>
                                <p>₹${item.price} × ${item.quantity}</p>
                            </div>
                            <div class="order-product-total">₹${item.price * item.quantity}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">Total: ₹${order.total}</div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn-cancel-order" onclick="cancelOrder('${order.id}')">Cancel Order</button>
                    ` : ''}
                    ${order.status === 'cancelled' ? `
                        <button class="btn-remove-order" onclick="removeOrder('${order.id}')">
                            <i class="fas fa-trash"></i> Remove from History
                        </button>
                    ` : ''}
                </div>
            `;
            
            ordersItems.appendChild(orderItem);
        });

        // Add clear all button if there are orders
        const clearAllButton = document.createElement('div');
        clearAllButton.className = 'clear-all-orders';
        clearAllButton.innerHTML = `
            <button class="btn-clear-all" onclick="clearOrderHistory()">
                <i class="fas fa-trash-alt"></i> Clear All Order History
            </button>
        `;
        ordersItems.appendChild(clearAllButton);
    }
    
    updateNotificationIndicators();
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
        // Add to orders
        const orderId = addToOrders({
            items: [...cart],
            total: document.getElementById('paymentTotal').textContent
        });
        
        // Clear cart after successful order
        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();
        
        // Close payment panel
        closePanel('paymentPanel');
        
        // Show success message with order number
        showNotification(`Order successful! Your order number is ${orderId}. Thank you!`);
        
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

// Hire payment functions
function proceedToHirePayment() {
    if (hires.length === 0) {
        showNotification('You haven\'t hired any professionals!');
        return;
    }
    
    // Update payment items
    const paymentItems = document.getElementById('hirePaymentItems');
    const paymentTotal = document.getElementById('hirePaymentTotal');
    
    if (paymentItems) {
        paymentItems.innerHTML = '';
        let total = 0;
        
        hires.forEach(hire => {
            const hireTotal = hire.price * hire.days;
            total += hireTotal;
            
            const paymentItem = document.createElement('div');
            paymentItem.className = 'hire-item';
            paymentItem.innerHTML = `
                <div class="hire-item-info">
                    <div class="hire-item-image">
                        <img src="${hire.image}" alt="${hire.name}">
                    </div>
                    <div class="hire-item-details">
                        <h4>${hire.name}</h4>
                        <p>${hire.profession} - ₹${hire.price}/day × ${hire.days} days</p>
                    </div>
                </div>
                <div class="hire-item-total">₹${hireTotal}</div>
            `;
            
            paymentItems.appendChild(paymentItem);
        });
        
        if (paymentTotal) paymentTotal.textContent = total;
    }
    
    // Reset payment method to COD by default
    document.getElementById('hireCod').checked = true;
    updateHirePaymentForm('cod');
    
    // Open payment panel
    closePanel('hirePanel');
    openPanel('hirePaymentPanel');
}

function processHirePayment() {
    const selectedPayment = document.querySelector('input[name="hirePayment"]:checked').value;
    
    // Validate based on payment method
    let isValid = true;
    let message = '';
    
    switch(selectedPayment) {
        case 'card':
            const cardNumber = document.getElementById('hireCardNumber').value;
            const expiry = document.getElementById('hireExpiry').value;
            const cvv = document.getElementById('hireCvv').value;
            const name = document.getElementById('hireName').value;
            
            if (!cardNumber || !expiry || !cvv || !name) {
                isValid = false;
                message = 'Please fill all card details';
            } else if (cardNumber.replace(/\s/g, '').length !== 16) {
                isValid = false;
                message = 'Please enter a valid 16-digit card number';
            }
            break;
            
        case 'upi':
            const upiId = document.getElementById('hireUpiId').value;
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
    showNotification('Processing your payment...');
    
    setTimeout(() => {
        // Update hire status to completed
        hires.forEach(hire => {
            hire.status = 'completed';
        });
        
        localStorage.setItem('hires', JSON.stringify(hires));
        updateHireUI();
        
        const paymentNumber = 'PAY' + Date.now().toString().slice(-6);
        
        // Close payment panel
        closePanel('hirePaymentPanel');
        
        // Show success message with payment number
        showNotification(`Payment successful! Your payment ID is ${paymentNumber}. Professionals have been notified.`);
        
        // Reset all forms
        resetHirePaymentForms();
    }, 2000);
}

function resetHirePaymentForms() {
    // Reset card form
    document.getElementById('hireCardNumber').value = '';
    document.getElementById('hireExpiry').value = '';
    document.getElementById('hireCvv').value = '';
    document.getElementById('hireName').value = '';
    
    // Reset UPI form
    document.getElementById('hireUpiId').value = '';
    
    // Reset to COD
    document.getElementById('hireCod').checked = true;
    updateHirePaymentForm('cod');
}

// Rating functions
function openRatingPanel(professionalId) {
    const professional = hires.find(hire => hire.id === professionalId);
    if (!professional) {
        showNotification('Professional not found!');
        return;
    }
    
    const ratingContent = document.getElementById('ratingContent');
    if (!ratingContent) {
        showNotification('Rating panel not found!');
        return;
    }
    
    ratingContent.innerHTML = `
        <div class="rating-professional">
            <div class="professional-header">
                <div class="professional-image">
                    <img src="${professional.image}" alt="${professional.name}">
                </div>
                <div class="professional-info">
                    <h3>${professional.name}</h3>
                    <p>${professional.profession}</p>
                </div>
            </div>
        </div>
        <div class="rating-form">
            <h3>How was your experience?</h3>
            <div class="rating-stars" id="ratingStars">
                <i class="far fa-star" data-rating="1"></i>
                <i class="far fa-star" data-rating="2"></i>
                <i class="far fa-star" data-rating="3"></i>
                <i class="far fa-star" data-rating="4"></i>
                <i class="far fa-star" data-rating="5"></i>
            </div>
            <textarea class="rating-comment" placeholder="Share your experience (optional)" id="ratingComment"></textarea>
            <button class="btn-submit-rating" onclick="submitRating('${professionalId}')">Submit Rating</button>
        </div>
    `;
    
    // Add star rating interaction
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star active';
                } else {
                    s.className = 'far fa-star';
                }
            });
            // Store rating in temporary variable
            document.getElementById('ratingStars').setAttribute('data-current-rating', rating);
        });
    });
    
    openPanel('ratingPanel');
    collapseFloatingButtons();
}

function submitRating(professionalId) {
    const professional = hires.find(hire => hire.id === professionalId);
    if (!professional) {
        showNotification('Professional not found!');
        return;
    }
    
    const ratingElement = document.getElementById('ratingStars');
    if (!ratingElement) {
        showNotification('Rating system error!');
        return;
    }
    
    const rating = parseInt(ratingElement.getAttribute('data-current-rating') || '0');
    const comment = document.getElementById('ratingComment') ? document.getElementById('ratingComment').value : '';
    
    if (rating === 0) {
        showNotification('Please select a rating');
        return;
    }
    
    // Update professional with rating
    professional.userRating = rating;
    professional.status = 'rated';
    professional.userComment = comment;
    
    localStorage.setItem('hires', JSON.stringify(hires));
    updateHireUI();
    
    // Show success message
    const ratingContent = document.getElementById('ratingContent');
    if (ratingContent) {
        ratingContent.innerHTML = `
            <div class="rating-success">
                <i class="fas fa-check-circle"></i>
                <h3>Thank You!</h3>
                <p>Your rating has been submitted successfully.</p>
                <button class="btn-continue" onclick="closePanel('ratingPanel')">Continue</button>
            </div>
        `;
    }
    
    showNotification('Rating submitted successfully!');
}

// Notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
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

// Initialize cart, hire, and orders UI on load
updateCartUI();
updateHireUI();
updateOrdersUI();
