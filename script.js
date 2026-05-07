const API_URL = "https://69f228b9b15130b97352a115.mockapi.io/catalog/clothing";

let allProducts = [];

async function loadProducts() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const productsContainer = document.getElementById('products');

    loading.style.display = 'block';
    error.style.display = 'none';
    productsContainer.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Помилка завантаження даних');

        allProducts = await response.json();
        
        renderProducts(allProducts);
    } catch (err) {
        console.error(err);
        error.textContent = "Не вдалося завантажити товари. Спробуйте пізніше.";
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

function renderProducts(products) {
    const container = document.getElementById('products');
    const noResults = document.getElementById('no-results');

    container.innerHTML = '';

    if (products.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <div class="desc">${product.description}</div>
            <div class="price">${product.price} грн</div>
            <button onclick="addToCart('${product.title}', ${product.price})">Купити</button>
        `;
        container.appendChild(card);
    });
}

function filterProducts() {
    const searchText = document.getElementById('search').value.toLowerCase().trim();
    const category = document.getElementById('category').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const filtered = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchText) ||
                             product.description.toLowerCase().includes(searchText);
        const matchesCategory = !category || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    renderProducts(filtered);
}

function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('category').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    renderProducts(allProducts);
}

// Функція додавання в кошик (сумісна з твоїм старим кодом)
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({name, price, date: new Date().toISOString()});
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} додано в кошик 🛒`);
}

// Завантаження при старті
window.onload = loadProducts;