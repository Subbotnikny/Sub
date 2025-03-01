// Кодовое слово для модераторской панели
const moderatorCode = 'green peace';

// Текущий пользователь из localStorage
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Инициализация товаров
let products = JSON.parse(localStorage.getItem('products')) || [
    { name: "Шарик для игры", points: 10 },
    { name: "Блокнот", points: 15 },
    { name: "Книга", points: 20 }
];
localStorage.setItem('products', JSON.stringify(products));

// Инициализация пользователей
let users = JSON.parse(localStorage.getItem('users')) || [];
localStorage.setItem('users', JSON.stringify(users));

// Навигация по страницам
function navigate(page) {
    const content = document.getElementById('content');
    switch (page) {
        case 'home':
            renderHome(content);
            break;
        case 'leaderboard':
            renderLeaderboard(content);
            break;
        case 'shop':
            renderShop(content);
            break;
        case 'profile':
            renderProfile(content);
            break;
        case 'moderator':
            renderModerator(content);
            break;
    }
}

// Главная страница
function renderHome(container) {
    container.innerHTML = `
        <h2>Добро пожаловать на субботники!</h2>
        <p>Примите участие и станьте лучшим!</p>
    `;
}

// Доска почёта
function renderLeaderboard(container) {
    container.innerHTML = `
        <h2>Доска почёта</h2>
        <p>Участвуйте в мероприятиях, чтобы попасть сюда!</p>
    `;
}

// Магазин
function renderShop(container) {
    container.innerHTML = `
        <h2>Магазин</h2>
        <p>Накопите баллы и обменивайте их на товары!</p>
        <ul id="product-list">
            ${products.map((product, index) => `
                <li>
                    ${product.name} - ${product.points} баллов
                    <button onclick="buyProduct(${index})">Купить</button>
                </li>
            `).join('')}
        </ul>
    `;
}

// Покупка товара
function buyProduct(index) {
    const product = products[index];
    if (currentUser.points >= product.points) {
        // Уменьшаем баллы пользователя
        currentUser.points -= product.points;
        localStorage.setItem('user', JSON.stringify(currentUser));

        // Отображаем новый профиль с обновленными баллами
        renderProfile(document.getElementById('content'));
        alert(`Вы купили ${product.name}!`);
    } else {
        alert('Недостаточно баллов для покупки этого товара!');
    }
}

// Рендер профиля
function renderProfile(container) {
    if (currentUser) {
        container.innerHTML = `
            <h2>Ваш профиль</h2>
            <p>Имя: ${currentUser.name}</p>
            <p>Баллы: ${currentUser.points}</p>
            <button onclick="editProfile()">Редактировать профиль</button>
            <button onclick="logout()">Выйти</button>
        `;
    } else {
        container.innerHTML = `
            <h2>Вход / Регистрация</h2>
            <input id="name" placeholder="Введите имя">
            <button onclick="register()">Зарегистрироваться</button>
        `;
    }
}

// Регистрация нового пользователя
function register() {
    const name = document.getElementById('name').value;
    if (name) {
        currentUser = { name, points: 0 };
        localStorage.setItem('user', JSON.stringify(currentUser));
        alert(`Добро пожаловать, ${name}!`);
        renderProfile(document.getElementById('content'));
    } else {
        alert('Введите имя для регистрации');
    }
}

// Редактирование профиля
function editProfile() {
    const newName = prompt('Введите новое имя:', currentUser.name);
    if (newName) {
        currentUser.name = newName;
        localStorage.setItem('user', JSON.stringify(currentUser));
        alert('Ваш профиль обновлен!');
        renderProfile(document.getElementById('content'));
    }
}

// Выход
function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    renderHome(document.getElementById('content'));
}

// Модераторская панель
function renderModerator(container) {
    const isAuthorized = localStorage.getItem('moderatorAccess');
    
    if (!isAuthorized) {
        const userCode = prompt('Введите кодовое слово для входа:');
        if (userCode === moderatorCode) {
            localStorage.setItem('moderatorAccess', true);
            alert('Доступ получен');
            renderModeratorPanel(container);
        } else {
            alert('Неверный код!');
            renderHome(container);
            return;
        }
    } else {
        renderModeratorPanel(container);
    }
}

// Модераторская панель - отображение
function renderModeratorPanel(container) {
    container.innerHTML = `
        <h2>Модераторская панель</h2>
        <h3>Пользователи</h3>
        <ul>
            ${renderUsers()}
        </ul>

        <h3>Добавить товар</h3>
        <form id="addProductForm">
            <label>Название товара:</label>
            <input type="text" id="product-name" required>
            <label>Цена в баллах:</label>
            <input type="number" id="product-points" required>
            <button type="submit">Добавить товар</button>
        </form>

        <h3>Товары</h3>
        <ul>
            ${renderProducts()}
        </ul>
        <button onclick="logoutModerator()">Выйти из панели</button>
    `;
    
    // Обработчик для добавления товара
    document.getElementById('addProductForm').onsubmit = function(event) {
        event.preventDefault();
        addProduct();
    };
}

// Вывод всех товаров
function renderProducts() {
    return products.map((product, index) => `
        <li>${product.name} - ${product.points} баллов 
        <button onclick="removeProduct(${index})">Удалить</button></li>
    `).join('');
}

// Удаление товара
function removeProduct(index) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    alert('Товар удален');
    renderModeratorPanel(document.getElementById('content'));
}

// Добавление товара
function addProduct() {
    const name = document.getElementById('product-name').value;
    const points = parseInt(document.getElementById('product-points').value);
    if (name && points > 0) {
        products.push({ name, points });
        localStorage.setItem('products', JSON.stringify(products));
        alert('Товар добавлен');
        renderModeratorPanel(document.getElementById('content'));
    }
}

// Вывод пользователей
function renderUsers() {
    return users.map((user, index) => `
        <li>${user.name} (${user.points}) 
        <button onclick="editUser(${index})">Редактировать</button></li>
    `).join('');
}

// Редактирование пользователя
function editUser(index) {
    const user = users[index];
    const newName = prompt('Имя пользователя:', user.name);
    const newPoints = prompt('Новые баллы:', user.points);
    if (newName && newPoints) {
        user.name = newName;
        user.points = parseInt(newPoints);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Пользователь обновлен');
        renderModeratorPanel(document.getElementById('content'));
    }
}

// Выход из модераторской панели
function logoutModerator() {
    localStorage.removeItem('moderatorAccess');
    alert('Выход из модератора');
    renderHome(document.getElementById('content'));
}

// Загрузка главной страницы
navigate('home');
