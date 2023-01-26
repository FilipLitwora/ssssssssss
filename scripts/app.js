//Select elements
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const subtotalEl = document.querySelector(".subtotal");

let products = [];

function renderProducts() {
  products.forEach((product) => {
    productsEl.innerHTML += `
    <div class="item" id="${product.id}">
    <div class="item-container">
        <div class="item-img">
            <img src="${product.images[0]}" alt="${product.name}">
        </div>
        <div class="desc">
            <h2>${product.title}</h2>
            <h3>${product.brand}</h3>
            <p>
            ${product.description}
            </p>
        </div>
        <div class="add-to-cart" >
          <h2><small>$</small>${product.price}</h2>
          <div class="btn minus" onClick="handleQuantityChange(${product.id}, -1)">-</div>
          <div class="product-unit">1</div>
          <div class="btn plus" onClick="handleQuantityChange(${product.id}, 1)">+</div>
          <img src="./assets/add-to-cart.png" alt="add to cart" onClick="addToCart(${product.id})">
        </div>
    </div>
</div>
    `;
  });
}

function getItemQuantityElement(id) {
  return document.getElementById(`${id}`).querySelector(".product-unit");
}

function handleQuantityChange(id, qty) {
  const currentQtyElement = getItemQuantityElement(id);
  const currentQty = Number(currentQtyElement.innerText);

  const newQty = Math.max(currentQty + qty, 1);

  currentQtyElement.innerText = newQty;
}

//cart array
let cart = JSON.parse(localStorage.getItem("CART")) || [];
updateCart();

//ADD to cart
function addToCart(id) {
  const qtyElement = getItemQuantityElement(id);

  const unitsToBeAdded = Number(qtyElement.innerText);
  qtyElement.innerText = 1; // after adding to cart, reset counter

  //check if product already exists in cart
  if (cart.some((item) => item.id === id)) {
    changeNumberOfUnits(unitsToBeAdded, id);
  } else {
    const item = products.find((product) => product.id === id);
    cart.push({
      ...item,
      numberOfUnits: unitsToBeAdded,
    });
  }

  updateCart();
}

//update cart
function updateCart() {
  renderCartItems();
  renderSubTotal();

  //save cart to local storage
  localStorage.setItem("CART", JSON.stringify(cart));
}

//calculate and render subtotal
function renderSubTotal() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });
  subtotalEl.innerHTML = `Grand Total: $${totalPrice.toFixed(2)}`;
}

//render cart items
function renderCartItems() {
  cartItemsEl.innerHTML = ""; //clear cart element
  cart.forEach((item) => {
    cartItemsEl.innerHTML += `
    <div class="cart-item">
                    <div class="item-info">
                        <h4>${item.title}</h4>
                    </div>
                    <div class="unit-price">
                        <small>$</small>${item.price}
                    </div>
                    <div class="units">
                        <div class="btn minus" onclick="changeNumberOfUnits(-1, ${item.id})">-</div>
                        <div class="number">${item.numberOfUnits}</div>
                        <div class="btn plus" onclick="changeNumberOfUnits(1, ${item.id})">+</div>
                    </div>
                    <div class="btn-delete" onclick="removeItemFromCart(${item.id})">
                      <img src="./assets/delete.png" alt="delete button">
                    </div>
    </div>
  `;
  });
}

//remove item from cart
function removeItemFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
}

//change number of units for an item in the cart
function changeNumberOfUnits(action, id) {
  cart = cart.map((item) => {
    let numberOfUnits = item.numberOfUnits;
    if (item.id === id) {
      numberOfUnits = Math.max(1, numberOfUnits + action);
    }
    return {
      ...item,
      numberOfUnits,
    };
  });
  updateCart();
}

async function fetchProducts() {
  const response = await fetch("https://dummyjson.com/products");
  const json = await response.json();
  products = json.products.map((p) => ({ ...p, numberOfUnits: 0 }));
  renderProducts();
}

fetchProducts();
