const STORAGE_KEY = "events_data";

let events = [];

const form = document.getElementById("createForm");
const tbody = document.getElementById("eventsTableBody");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    renderTable();
});

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

function validateo(dt) {
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

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const dto = readForm();
    if (!validate(dto)) return;

    if (dto.id) {
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
        events.push({
            id: Date.now(),
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

function resetForm() {
    form.reset();
    document.getElementById("editIdInput").value = "";
    document.getElementById("formTitle").innerText = "Додати подію";
    document.getElementById("submitBtn").innerText = "Додати";
    clearAllErrors();
    document.getElementById("titleInput").focus();
}

resetBtn.addEventListener("click", resetForm);

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

searchInput.addEventListener("input", renderTable);
sortSelect.addEventListener("change", renderTable);

tbody.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("delete-btn")) {
        const id = Number(target.dataset.id);
        events = events.filter(ev => ev.id !== id);
        saveToStorage();
        renderTable();
    }

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

            document.getElementById("formTitle").innerText = "Редагування події";
            document.getElementById("submitBtn").innerText = "Зберегти зміни";
            clearAllErrors();
        }
    }
});