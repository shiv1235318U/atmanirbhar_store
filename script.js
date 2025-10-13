// Scroll
document.getElementById("exploreBtn").addEventListener("click",()=>document.getElementById("products").scrollIntoView({behavior:"smooth"}));

// Open/Close
function openPanel(id){document.getElementById(id).classList.add("open");}
function closePanel(id){document.getElementById(id).classList.remove("open");}

// Buy Now main slides
document.querySelectorAll(".product button").forEach(btn=>{
  btn.addEventListener("click",()=>openPanel(btn.dataset.panel));
});

// Sub-subslide
document.querySelectorAll(".product-item[data-subslide]").forEach(item=>{
  item.addEventListener("click",()=>openPanel(item.dataset.subslide));
});

// Cart
let cart=JSON.parse(localStorage.getItem("cart"))||[];
function addToCart(item){cart.push(item);localStorage.setItem("cart",JSON.stringify(cart));updateCart();alert(item+" added to cart!");}
function updateCart(){document.getElementById("cartItems").innerHTML=cart.length?cart.map(i=>`<p>🛍️ ${i}</p>`).join(""):"<p>Your cart is empty.</p>";}
function clearCart(){cart=[];localStorage.removeItem("cart");updateCart();}
updateCart();
document.getElementById("cartBtn").addEventListener("click",()=>openPanel('cartPanel'));

// Contact
document.getElementById("contactForm").addEventListener("submit",e=>{e.preventDefault();alert("Thank you! Your message has been sent.");e.target.reset();});
