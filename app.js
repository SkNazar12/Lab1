// Масив in-memory
let events = [];

// DOM
const form = document.getElementById("createForm");
const tbody = document.getElementById("eventsTableBody");
const resetBtn = document.getElementById("resetBtn");

// if error handler
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

// Обробка відправки
form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors();

    const title = document.getElementById("titleInput").value.trim();
    const date = document.getElementById("dateInput").value;
    const location = document.getElementById("locationInput").value.trim();
    const capacityStr = document.getElementById("capacityInput").value.trim();
    const desc = document.getElementById("descInput").value.trim();

    let isValid = true;

    if (title === "") {
        showError("titleInput", "titleError", "Введіть назву події.");
        isValid = false;
    }
    if (date === "") {
        showError("dateInput", "dateError", "Оберіть дату.");
        isValid = false;
    }
    if (location === "") {
        showError("locationInput", "locationError", "Вкажіть локацію.");
        isValid = false;
    }
    
    const capacity = Number(capacityStr);
    if (capacityStr === "" || Number.isNaN(capacity) || capacity < 1) {
        showError("capacityInput", "capacityError", "Кількість місць має бути більше 0.");
        isValid = false;
    }
    if (desc === "") {
        showError("descInput", "descError", "Додайте опис події.");
        isValid = false;
    }

    if (!isValid) return;

    events.push({
        title,
        date,
        location,
        capacity,
        desc
    });

    renderTable();
    form.reset();
});

resetBtn.addEventListener("click", () => {
    form.reset();
    clearAllErrors();
});

// show tabl
function renderTable() {
    const rowsHtml = events.map((ev, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${ev.title}</td>
            <td>${ev.date}</td>
            <td>${ev.location}</td>
            <td>${ev.capacity}</td>
            <td>${ev.desc}</td>
        </tr>
    `).join("");
    
    tbody.innerHTML = rowsHtml;
}