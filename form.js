// form.js

// Твоє посилання на MockAPI
const API_URL = "https://69fb46d888a7af0ecca8e6f9.mockapi.io/orders/orders";

// 1. Отримуємо дані з кошика (LocalStorage)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartDiv = document.getElementById("cart");
const totalDiv = document.getElementById("total");
const formBlock = document.getElementById("formBlock");
const resultDiv = document.getElementById("result");

// 2. Функція відображення товарів у кошику
function renderCart() {
    cartDiv.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartDiv.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Твій кошик порожній 🌸</p>";
        totalDiv.innerHTML = "";
        formBlock.style.display = "none"; // Ховаємо форму, якщо кошик порожній
        return;
    }

    formBlock.style.display = "block"; // Показуємо форму

    cart.forEach((item, index) => {
        total += item.price;
        cartDiv.innerHTML += `
            <div class="item">
                <span><b>${item.name}</b></span>
                <div>
                    <span style="color:#ff1493; font-weight:bold; margin-right:15px;">${item.price} грн</span>
                    <button onclick="removeItem(${index})" style="background:#ff4d4d; padding:5px 10px;">✕</button>
                </div>
            </div>
        `;
    });

    totalDiv.innerHTML = `Разом до сплати: ${total} грн`;
}

// 3. Видалення товару
window.removeItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
};

// 4. Очищення всього кошика
document.getElementById("clearCartBtn").onclick = () => {
    if(confirm("Очистити весь кошик?")) {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    }
};

// 5. Обробка натискання кнопки "Підтвердити замовлення"
document.getElementById("submitBtn").onclick = async function() {
    // Очищаємо старі помилки
    document.querySelectorAll('.error').forEach(el => el.innerText = "");

    // Зчитуємо дані з усіх полів
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value;
    
    // Зчитуємо радіокнопки (Доставка та Оплата)
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const payment = document.querySelector('input[name="pay"]:checked').value;
    
    // Зчитуємо чекбокс (Подарунок)
    const isGift = document.getElementById("gift").checked;

    // Валідація (перевірка на порожні поля)
    let hasError = false;

    if (name.length < 2) {
        document.getElementById("nameError").innerText = "Введіть коректне ім'я";
        hasError = true;
    }
    if (phone.length < 10) {
        document.getElementById("phoneError").innerText = "Введіть номер телефону";
        hasError = true;
    }
    if (!address) {
        document.getElementById("addressError").innerText = "Вкажіть адресу доставки";
        hasError = true;
    }
    if (!city) {
        document.getElementById("cityError").innerText = "Оберіть місто зі списку";
        hasError = true;
    }

    if (hasError) return; // Зупиняємо, якщо є помилки

    // Розрахунок фінальної суми (додаємо 50 грн, якщо обрано упаковку)
    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let finalPrice = isGift ? subtotal + 50 : subtotal;

    // Створюємо об'єкт замовлення
    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerCity: city,
        deliveryMethod: delivery,
        paymentMethod: payment,
        giftWrap: isGift,
        items: cart,
        totalAmount: finalPrice,
        date: new Date().toLocaleString()
    };

    // Блокуємо кнопку під час відправки
    this.disabled = true;
    this.innerText = "Відправляємо...";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            
            // Показуємо успішне повідомлення
            formBlock.style.display = "none";
            cartDiv.style.display = "none";
            totalDiv.style.display = "none";
            document.getElementById("clearCartBtn").style.display = "none";

            resultDiv.innerHTML = `
                <div style="text-align:center; padding:30px; background:#eaffea; border:2px solid #2ecc71; border-radius:15px; margin-top:20px;">
                    <h2 style="color:#27ae60; border:none;">✨ Замовлення №${result.id} прийнято!</h2>
                    <p style="font-size:18px;">Дякуємо, <b>${name}</b>! Ми зателефонуємо вам найближчим часом.</p>
                    <p style="margin-top:10px;">Сума до сплати: <b>${finalPrice} грн</b></p>
                    <button onclick="window.location.href='index.html'" style="margin-top:20px;">На головну</button>
                </div>
            `;

            // Очищаємо кошик після успіху
            localStorage.removeItem("cart");
        } else {
            throw new Error("Помилка сервера");
        }
    } catch (error) {
        alert("Сталася помилка при відправці. Спробуйте ще раз!");
        this.disabled = false;
        this.innerText = "Підтвердити замовлення";
    }
};

// Запускаємо відображення при завантаженні сторінки
renderCart();