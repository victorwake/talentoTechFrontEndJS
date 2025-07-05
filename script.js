const STORAGE_KEY = 'cart';
let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const productsContainer = document.getElementById('products-container');
    const loadMoreBtn = document.getElementById('load-more');
    let skip = 0;
    const limit = 5;
    let totalProducts = 0;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });

    async function fetchProducts() {
        try {
            const response = await fetch(`https://dummyjson.com/products/category/fragrances?skip=${skip}&limit=${limit}`);
            const data = await response.json();

            totalProducts = data.total;
            displayProducts(data.products);

            if (skip + limit >= totalProducts) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = '<p class="error">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }

    function displayProducts(products) {
        if (products.length === 0) {
            productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const discountedPrice = (product.price - (product.price * product.discountPercentage / 100)).toFixed(2);

            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 >= 0.5;
            let starsHTML = '';

            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsHTML += '<i class="fas fa-star"></i>';
                } else if (i === fullStars && hasHalfStar) {
                    starsHTML += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHTML += '<i class="far fa-star"></i>';
                }
            }

            productCard.innerHTML = `
                <div class="cards">
                    <div class="image-container">
                        <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-brand">${product.brand}</p>
                        <p class="product-description">${product.description}</p>
                        <div class="product-rating">
                            <div class="stars">${starsHTML}</div>
                            <span>${product.rating}</span>
                        </div>
                        <p class="product-price">$${discountedPrice} <span class="original-price">$${product.price.toFixed(2)}</span></p>
                        <p class="stock">Disponibles: ${product.stock}</p>
                        <button class="add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${discountedPrice}" data-image="${product.thumbnail}">Agregar al Carrito</button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    function addToCart(e) {
        const button = e.target;
        const product = {
            id: button.dataset.id,
            title: button.dataset.title,
            price: button.dataset.price,
            image: button.dataset.image,
            quantity: 1
        };

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();

        button.textContent = '✓ Agregado';
        button.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            button.textContent = 'Agregar al Carrito';
            button.style.backgroundColor = '#2c3e50';
        }, 2000);
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = count;
        });
    }

    loadMoreBtn.addEventListener('click', function () {
        skip += limit;
        fetchProducts();
    });

    fetchProducts();
    updateCartCount();
});


// Carrito
document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.getElementById("cart-items");
  const subtotalElement = document.getElementById("subtotal");
  const shippingElement = document.getElementById("shipping");
  const totalElement = document.getElementById("total");
  const cartCountElements = document.querySelectorAll(".cart-count");

  updateCartCount();
  displayCartItems();

  function displayCartItems() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="empty-cart-message">Tu carrito está vacío</p>';
      subtotalElement.textContent = "$0.00";
      shippingElement.textContent = "$0.00";
      totalElement.textContent = "$0.00";
      return;
    }

    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      subtotal += itemTotal;

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
    <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <p class="cart-item-price">$${parseFloat(item.price).toFixed(2)} x ${
        item.quantity
      } = $${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
        <div class="quantity-controls">
            <button class="decrease-qty" data-id="${item.id}">-</button>
            <span class="item-qty">${item.quantity}</span>
            <button class="increase-qty" data-id="${item.id}">+</button>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
    </div>
`;

      cartItemsContainer.appendChild(cartItem);
    });

    // Botón aumentar cantidad
    document.querySelectorAll(".increase-qty").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = button.dataset.id;
        const product = cart.find((item) => item.id === productId);
        if (product) {
          product.quantity += 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
          updateCartCount();
          displayCartItems();
        }
      });
    });

    // Botón disminuir cantidad
    document.querySelectorAll(".decrease-qty").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = button.dataset.id;
        const product = cart.find((item) => item.id === productId);
        if (product && product.quantity > 1) {
          product.quantity -= 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
          updateCartCount();
          displayCartItems();
        } else if (product && product.quantity === 1) {
          // Si baja a 0, se elimina el producto
          cart = cart.filter((item) => item.id !== productId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
          updateCartCount();
          displayCartItems();
        }
      });
    });

    const shipping = subtotal > 100 ? 0 : 5.99;
    const total = subtotal + shipping;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;

    document.querySelectorAll(".cart-item-remove").forEach((button) => {
      button.addEventListener("click", removeFromCart);
    });
  }

  function removeFromCart(e) {
    const productId = e.target.dataset.id;
    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
  }

  function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach((el) => {
      el.textContent = count;
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const checkoutBtn = document.querySelector(".checkout-btn");

  checkoutBtn.addEventListener("click", function () {
    const totalElement = document.getElementById("total");
    const total = totalElement ? totalElement.textContent.trim() : "$0.00";

    const confirmed = confirm(
      `El total a pagar es ${total}.\n¿Está seguro que desea realizar la compra?`
    );

    if (confirmed) {
      alert(
        "¡Pago realizado con éxito!\nSu pedido será enviado a la brevedad."
      );

      localStorage.removeItem(STORAGE_KEY);

      const cartItems = document.getElementById("cart-items");
      cartItems.innerHTML =
        '<p class="empty-cart-message">Tu carrito está vacío</p>';

      document.getElementById("subtotal").textContent = "$0.00";
      document.getElementById("shipping").textContent = "$0.00";
      document.getElementById("total").textContent = "$0.00";

      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        cartCount.textContent = "0";
      }
    }
  });
});

