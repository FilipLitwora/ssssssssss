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
      isChecked: true,
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
  let totalPrice = 0;
  cart.forEach((item) => {
    if (item.isChecked) {
      totalPrice += item.price * item.numberOfUnits;
    }
  });
  subtotalEl.innerHTML = `Grand Total: $${totalPrice.toFixed(2)}`;
}

function splitCartByManufacturer(cart) {
  const manufacturers = [];
  cart.forEach((p) => {
    const i = manufacturers.findIndex((m) => m[0].brand === p.brand);
    if (i === -1) {
      manufacturers.push([p]);
    } else {
      manufacturers[i].push(p);
    }
  });
  return manufacturers;
}

function handleProductCheckbox(id) {
  const i = cart.findIndex((p) => p.id === id);
  if (i != -1) {
    cart[i] = { ...cart[i], isChecked: !cart[i].isChecked };
  }

  updateCart();
}

function handleManufacturerCheckbox(value, brand) {
  cart.forEach((p) => {
    if (p.brand === brand) {
      p.isChecked = !value;
    }
  });

  updateCart();
}

//render cart items
function renderCartItems() {
  const manufacturers = splitCartByManufacturer(cart);
  cartItemsEl.innerHTML = manufacturers
    .map((m) => {
      let sum = 0;
      const brand = m[0].brand;
      const value = m.some((p) => p.isChecked);
      const manufacturerCheckbox = `
          <input onChange="handleManufacturerCheckbox(${value},'${brand}')" type="checkbox" ${
        value ? "checked" : ""
      }
        `;

      let html = `<div class="manufacturer">
      <div class="manufacturer-heading">
          ${manufacturerCheckbox}
          <h3>${brand}</h3>
      </div>
         ${m
           .map((item) => {
             if (item.isChecked) {
               sum += item.price * item.numberOfUnits;
             }
             return `
                  <div class="cart-item">
                       <div class="item-info">
                           ${
                             m.length > 1
                               ? `<input onChange="handleProductCheckbox(${
                                   item.id
                                 })" type="checkbox" ${
                                   item.isChecked ? "checked" : ""
                                 }>`
                               : ""
                           }
                           <h4>${item.title}</h4>
                       </div>
                       <div class="unit-price">
                           <small>$</small>${item.price}
                       </div>
                       <div class="units">
                           <div class="btn minus" onclick="changeNumberOfUnits(-1, ${
                             item.id
                           })">-</div>
                           <div class="number">${item.numberOfUnits}</div>
                           <div class="btn plus" onclick="changeNumberOfUnits(1, ${
                             item.id
                           })">+</div>
                       </div>
                       <div class="btn-delete" onclick="removeItemFromCart(${
                         item.id
                       })">
                         <img src="./assets/delete.png" alt="delete button">
                       </div>
                 </div>
       `;
           })
           .join("")}
      `;
      html += `
      <h4>Total: $${sum}</h4>
        </div>
        `;
      return html;
    })
    .join("");
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
