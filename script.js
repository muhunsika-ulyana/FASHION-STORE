const API_URL = "https://69f228b9b15130b97352a115.mockapi.io/catalog/clothing";

let allProducts = [];

// 1. Завантаження даних з API
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

// 2. Відображення карток товарів
function renderProducts(products) {
    const container = document.getElementById('products');
    const noResults = document.getElementById('no-results');

    container.innerHTML = '';

    if (products.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product';
        
        // Додаємо відображення розміру та кольору в HTML-структуру
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <div class="desc">${product.description}</div>
            
            <div class="product-meta">
                <p><strong>Розмір:</strong> ${product.size || 'Не вказано'}</p>
                <p><strong>Колір:</strong> ${product.color || 'Не вказано'}</p>
            </div>

            <div class="price">${product.price} грн</div>
            <button onclick="addToCart('${product.title}', ${product.price})">Купити</button>
        `;
        container.appendChild(card);
    });
}

// 3. Фільтрація товарів
function filterProducts() {
    const searchText = document.getElementById('search').value.toLowerCase().trim();
    const category = document.getElementById('category').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const filtered = allProducts.filter(product => {
        const title = product.title ? product.title.toLowerCase() : "";
        const description = product.description ? product.description.toLowerCase() : "";
        
        const matchesSearch = title.includes(searchText) || description.includes(searchText);
        const matchesCategory = !category || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    renderProducts(filtered);
}

// 4. Скидання фільтрів
function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('category').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    renderProducts(allProducts);
}

// 5. Додавання в кошик
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({
        name, 
        price, 
        date: new Date().toISOString()
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} додано в кошик 🛒`);
}

// Ініціалізація при завантаженні сторінки
window.onload = loadProducts;