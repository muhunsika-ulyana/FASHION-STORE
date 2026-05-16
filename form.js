// form.js

// 1. Конфігурація та ініціалізація
const API_URL = "https://69fb46d888a7af0ecca8e6f9.mockapi.io/orders/orders";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartDiv = document.getElementById("cart");
const totalDiv = document.getElementById("total");
const formBlock = document.getElementById("formBlock");
const resultDiv = document.getElementById("result");

// Поля вводу для налаштування обмежень
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

// --- ОБМЕЖЕННЯ ВВОДУ "НА ЛЬОТУ" ---

// Дозволяємо лише літери в імені (укр, англ, пробіли)
nameInput.oninput = function() {
    this.value = this.value.replace(/[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g, '');
};

// Дозволяємо лише цифри в телефоні
phoneInput.oninput = function() {
    this.value = this.value.replace(/[^0-9]/g, '');
};

// --- ОСНОВНА ЛОГІКА КОШИКА ---

function renderCart() {
    cartDiv.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartDiv.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Твій кошик порожній 🌸</p>";
        totalDiv.innerHTML = "";
        formBlock.style.display = "none";
        return;
    }

    formBlock.style.display = "block";

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

window.removeItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
};

document.getElementById("clearCartBtn").onclick = () => {
    if(confirm("Очистити весь кошик?")) {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    }
};

// --- ВІДПРАВКА ЗАМОВЛЕННЯ ---

document.getElementById("submitBtn").onclick = async function() {
    document.querySelectorAll('.error').forEach(el => el.innerText = "");

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value;
    
    const deliveryEl = document.querySelector('input[name="delivery"]:checked');
    const paymentEl = document.querySelector('input[name="pay"]:checked');
    const isGift = document.getElementById("gift").checked;

    let hasError = false;

    // Регулярний вираз для перевірки, що в імені немає цифр і воно не порожнє
    const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/;

    if (!nameRegex.test(name) || name.length < 2) {
        document.getElementById("nameError").innerText = "Ім'я має містити лише літери (мін. 2)";
        hasError = true;
    }
    // Перевірка телефону (має бути рівно 10-12 цифр, без літер)
    if (phone.length < 10) {
        document.getElementById("phoneError").innerText = "Введіть коректний номер (мінімум 10 цифр)";
        hasError = true;
    }
    if (!address) {
        document.getElementById("addressError").innerText = "Вкажіть адресу доставки";
        hasError = true;
    }
    if (!city) {
        document.getElementById("cityError").innerText = "Оберіть місто";
        hasError = true;
    }
    if (!deliveryEl || !paymentEl) {
        alert("Оберіть спосіб доставки та оплати");
        hasError = true;
    }

    if (hasError) return;

    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let finalPrice = isGift ? subtotal + 50 : subtotal;

    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerCity: city,
        deliveryMethod: deliveryEl.value,
        paymentMethod: paymentEl.value,
        giftWrap: isGift,
        items: cart,
        totalAmount: finalPrice,
        date: new Date().toLocaleString()
    };

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
            
            formBlock.style.display = "none";
            cartDiv.style.display = "none";
            totalDiv.style.display = "none";
            document.getElementById("clearCartBtn").style.display = "none";

            resultDiv.innerHTML = `
                <div style="text-align:center; padding:30px; background:#eaffea; border:2px solid #2ecc71; border-radius:15px; margin-top:20px;">
                    <h2 style="color:#27ae60; border:none;">✨ Замовлення №${result.id} прийнято!</h2>
                    <p style="font-size:18px;">Дякуємо, <b>${name}</b>! Ми зателефонуємо вам за номером <b>${phone}</b>.</p>
                    <p style="margin-top:10px;">Сума до сплати: <b>${finalPrice} грн</b></p>
                    <button onclick="window.location.href='index.html'" style="margin-top:20px; padding:10px 20px; cursor:pointer;">На головну</button>
                </div>
            `;

            localStorage.removeItem("cart");
        } else {
            throw new Error("Помилка сервера");
        }
    } catch (error) {
        alert("Сталася помилка. Спробуйте ще раз!");
        this.disabled = false;
        this.innerText = "Підтвердити замовлення";
    }
};

// --- ВІДГУКИ ---

window.addNewReview = function() {
    const rNameInput = document.getElementById('reviewer-name');
    const rTextInput = document.getElementById('review-text');
    const container = document.getElementById('reviews-container');
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    
    // Валідація імені у відгуку (лише літери)
    const nameValue = rNameInput.value.trim();
    const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/;

    if (!nameRegex.test(nameValue) || rTextInput.value.trim() === "" || !ratingInput) {
        alert("Заповніть ім'я (тільки літери), текст та оберіть оцінку!");
        return;
    }

    const stars = "⭐".repeat(ratingInput.value);
    const newReview = document.createElement('div');
    newReview.className = 'review';
    newReview.style.animation = "fadeIn 0.5s ease-in-out";
    newReview.innerHTML = `<b>${stars}</b> ${rTextInput.value} — <i>${nameValue}</i>`;

    container.insertBefore(newReview, container.firstChild);

    rNameInput.value = "";
    rTextInput.value = "";
    ratingInput.checked = false;

    alert("Дякуємо за відгук!");
};

// Старт
renderCart();