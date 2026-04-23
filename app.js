// Ключ для збереження в LocalStorage
const STORAGE_KEY = "events_data";

// Стан (масив записів)
let events = [];

// DOM-елементи
const form = document.getElementById("createForm");
const tbody = document.getElementById("eventsTableBody");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// Ініціалізація при завантаженні
document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    renderTable();
});

// --- РОБОТА З LOCAL STORAGE ---
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            events = JSON.parse(data);
        } catch (e) {
            events = [];
        }
    }
}

// --- ФУНКЦІЇ ДЛЯ ПОМИЛОК ---
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).innerHTML = message;
}

function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove("invalid");
    document.getElementById(errorId).innerHTML = "";
}

function clearAllErrors() {
    clearError("titleInput", "titleError");
    clearError("dateInput", "dateError");
    clearError("locationInput", "locationError");
    clearError("capacityInput", "capacityError");
    clearError("descInput", "descError");
}

// --- ЧИТАННЯ ФОРМИ (DTO) ---
function readForm() {
    return {
        id: document.getElementById("editIdInput").value, // якщо порожньо - створюємо нове
        title: document.getElementById("titleInput").value.trim(),
        date: document.getElementById("dateInput").value,
        location: document.getElementById("locationInput").value.trim(),
        capacityStr: document.getElementById("capacityInput").value.trim(),
        desc: document.getElementById("descInput").value.trim()
    };
}

// --- ВАЛІДАЦІЯ ---
function validate(dto) {
    clearAllErrors();
    let isValid = true;

    if (dto.title === "") {
        showError("titleInput", "titleError", "Введіть назву події.");
        isValid = false;
    } else if (dto.title.length < 3) {
        showError("titleInput", "titleError", "Назва має містити щонайменше 3 символи.");
        isValid = false;
    }

    if (dto.date === "") {
        showError("dateInput", "dateError", "Оберіть дату.");
        isValid = false;
    }

    if (dto.location === "") {
        showError("locationInput", "locationError", "Вкажіть локацію.");
        isValid = false;
    }
    
    const capacity = Number(dto.capacityStr);
    if (dto.capacityStr === "" || Number.isNaN(capacity) || capacity < 1) {
        showError("capacityInput", "capacityError", "Кількість місць має бути більше 0.");
        isValid = false;
    }

    if (dto.desc === "") {
        showError("descInput", "descError", "Додайте опис події.");
        isValid = false;
    }

    return isValid;
}

// --- ОБРОБКА ФОРМИ (SUBMIT) ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const dto = readForm();
    if (!validate(dto)) return;

    if (dto.id) {
        // Редагування існуючого запису
        const index = events.findIndex(ev => ev.id === Number(dto.id));
        if (index !== -1) {
            events[index] = {
                id: Number(dto.id),
                title: dto.title,
                date: dto.date,
                location: dto.location,
                capacity: Number(dto.capacityStr),
                desc: dto.desc
            };
        }
    } else {
        // Додавання нового запису
        events.push({
            id: Date.now(), // Автоматична генерація унікального ID
            title: dto.title,
            date: dto.date,
            location: dto.location,
            capacity: Number(dto.capacityStr),
            desc: dto.desc
        });
    }

    saveToStorage();
    renderTable();
    resetForm();
});

// --- СКИДАННЯ ФОРМИ ---
function resetForm() {
    form.reset();
    document.getElementById("editIdInput").value = "";
    document.getElementById("formTitle").innerText = "Додати подію";
    document.getElementById("submitBtn").innerText = "Додати";
    clearAllErrors();
    document.getElementById("titleInput").focus(); // UX: повертаємо курсор у перше поле
}

resetBtn.addEventListener("click", resetForm);

// --- ДИНАМІЧНИЙ РЕНДЕР ТАБЛИЦІ (З ПОШУКОМ І СОРТУВАННЯМ) ---
function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const sortType = sortSelect.value;

    // Фільтрація за пошуком
    let filteredEvents = events.filter(ev => 
        ev.title.toLowerCase().includes(searchTerm)
    );

    // Сортування
    if (sortType === "dateAsc") {
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortType === "dateDesc") {
        filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Генерація HTML
    const rowsHtml = filteredEvents.map((ev, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${ev.title}</td>
            <td>${ev.date}</td>
            <td>${ev.location}</td>
            <td>${ev.capacity}</td>
            <td>${ev.desc}</td>
            <td>
                <button type="button" class="action-btn edit-btn" data-id="${ev.id}">Ред.</button>
                <button type="button" class="action-btn delete-btn" data-id="${ev.id}">Вид.</button>
            </td>
        </tr>
    `).join("");
    
    tbody.innerHTML = rowsHtml;
}

// --- ОБРОБКА ПОШУКУ ТА СОРТУВАННЯ ---
searchInput.addEventListener("input", renderTable);
sortSelect.addEventListener("change", renderTable);

// --- ДЕЛЕГУВАННЯ ПОДІЙ ДЛЯ КНОПОК В ТАБЛИЦІ ---
tbody.addEventListener("click", (e) => {
    const target = e.target;

    // Видалення
    if (target.classList.contains("delete-btn")) {
        const id = Number(target.dataset.id);
        events = events.filter(ev => ev.id !== id);
        saveToStorage();
        renderTable();
    }

    // Редагування
    if (target.classList.contains("edit-btn")) {
        const id = Number(target.dataset.id);
        const evToEdit = events.find(ev => ev.id === id);
        
        if (evToEdit) {
            document.getElementById("editIdInput").value = evToEdit.id;
            document.getElementById("titleInput").value = evToEdit.title;
            document.getElementById("dateInput").value = evToEdit.date;
            document.getElementById("locationInput").value = evToEdit.location;
            document.getElementById("capacityInput").value = evToEdit.capacity;
            document.getElementById("descInput").value = evToEdit.desc;
            
            // Змінюємо UX форми
            document.getElementById("formTitle").innerText = "Редагування події";
            document.getElementById("submitBtn").innerText = "Зберегти зміни";
            clearAllErrors();
        }
    }
});