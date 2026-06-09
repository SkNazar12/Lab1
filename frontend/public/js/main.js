import {
  createEvent,
  deleteEvent,
  getEvents,
  registerUser,
  updateEvent
} from "./apiClient.js";

import {
  clearErrors,
  fillForm,
  renderEvents,
  renderListStatus,
  resetForm,
  setFieldError,
  showNotice
} from "./ui.js";

let currentEvents = [];

function getFilters() {
  const searchValue = document.getElementById("searchInput").value.trim();
  const sortValue = document.getElementById("sortSelect").value;
  const [sort, order] = sortValue.split("_");

  return {
    q: searchValue,
    sort,
    order
  };
}

function readForm() {
  return {
    title: document.getElementById("titleInput").value.trim(),
    date: document.getElementById("dateInput").value,
    location: document.getElementById("locationInput").value.trim(),
    capacity: Number(document.getElementById("capacityInput").value),
    description: document.getElementById("descriptionInput").value.trim()
  };
}

function validateForm(dto) {
  clearErrors();

  let valid = true;

  if (dto.title.length < 3) {
    setFieldError("title", "Назва має містити мінімум 3 символи");
    valid = false;
  }

  if (!dto.date) {
    setFieldError("date", "Оберіть дату");
    valid = false;
  }

  if (dto.location.length < 2) {
    setFieldError("location", "Локація має містити мінімум 2 символи");
    valid = false;
  }

  if (!Number.isInteger(dto.capacity) || dto.capacity < 1) {
    setFieldError("capacity", "Кількість місць має бути додатним числом");
    valid = false;
  }

  return valid;
}

async function loadEvents() {
  renderListStatus("loading");

  try {
    const response = await getEvents(getFilters());
    currentEvents = response.data || [];

    if (currentEvents.length === 0) {
      renderEvents([]);
      renderListStatus("empty");
      return;
    }

    renderEvents(currentEvents);
    renderListStatus("success");
  } catch (err) {
    renderListStatus("error", err);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById("editIdInput").value;
  const dto = readForm();

  if (!validateForm(dto)) return;

  try {
    if (editId) {
      await updateEvent(editId, dto);
      showNotice("Подію оновлено");
    } else {
      await createEvent(dto);
      showNotice("Подію створено");
    }

    resetForm();
    await loadEvents();
  } catch (err) {
    showNotice(err?.message || "Помилка збереження", "error");
  }
}

async function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  const selectedEvent = currentEvents.find((item) => item.id === id);

  if (action === "edit" && selectedEvent) {
    fillForm(selectedEvent);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const confirmed = confirm("Видалити цю подію?");
    if (!confirmed) return;

    try {
      await deleteEvent(id);
      showNotice("Подію видалено");
      await loadEvents();
    } catch (err) {
      showNotice(err?.message || "Помилка видалення", "error");
    }

    return;
  }

  if (action === "register") {
    const userIdText = prompt(
      "Введіть ID користувача для X-Demo-UserId. Наприклад: 1 або 2",
      "1"
    );

    if (!userIdText) return;

    const userId = Number(userIdText);

    if (!Number.isInteger(userId) || userId < 1) {
      showNotice("ID користувача має бути додатним числом", "error");
      return;
    }

    try {
      await registerUser(id, userId);
      showNotice("Користувача зареєстровано на подію");
      await loadEvents();
    } catch (err) {
      showNotice(err?.message || "Помилка реєстрації", "error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const eventForm = document.getElementById("eventForm");
  const resetBtn = document.getElementById("resetBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const eventsTableBody = document.getElementById("eventsTableBody");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  if (!eventForm || !eventsTableBody) {
    console.error("HTML не співпадає з JS. Перевір id='eventForm' і id='eventsTableBody'.");
    return;
  }

  eventForm.addEventListener("submit", handleSubmit);

  if (resetBtn) resetBtn.addEventListener("click", resetForm);
  if (refreshBtn) refreshBtn.addEventListener("click", loadEvents);

  eventsTableBody.addEventListener("click", handleTableClick);

  if (searchInput) searchInput.addEventListener("input", loadEvents);
  if (sortSelect) sortSelect.addEventListener("change", loadEvents);

  loadEvents();
});