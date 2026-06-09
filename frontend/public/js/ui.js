function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function showNotice(message, type = "success") {
  const el = document.getElementById("notice");
  if (!el) return;

  el.className = `notice ${type}`;
  el.textContent = message;

  if (message) {
    setTimeout(() => {
      el.textContent = "";
      el.className = "";
    }, 3000);
  }
}

export function renderListStatus(status, error) {
  const el = document.getElementById("listStatus");
  if (!el) return;

  if (status === "loading") {
    el.className = "status loading";
    el.textContent = "Завантаження...";
    return;
  }

  if (status === "empty") {
    el.className = "status empty";
    el.textContent = "Подій поки немає";
    return;
  }

  if (status === "error") {
    el.className = "status error";
    el.textContent = `Помилка: ${error?.message || "невідома помилка"}`;
    return;
  }

  el.className = "";
  el.textContent = "";
}

export function renderEvents(events) {
  const tbody = document.getElementById("eventsTableBody");
  if (!tbody) return;

  tbody.innerHTML = events
    .map((event) => {
      const placesText = `${event.registrationsCount ?? 0}/${event.capacity}`;

      return `
        <tr>
          <td>${escapeHtml(event.id)}</td>
          <td>${escapeHtml(event.title)}</td>
          <td>${escapeHtml(event.date)}</td>
          <td>${escapeHtml(event.location)}</td>
          <td>${escapeHtml(placesText)}</td>
          <td>${escapeHtml(event.description || "—")}</td>
          <td class="actions">
            <button type="button" data-action="register" data-id="${escapeHtml(event.id)}">Зареєструвати</button>
            <button type="button" data-action="edit" data-id="${escapeHtml(event.id)}">Редагувати</button>
            <button type="button" data-action="delete" data-id="${escapeHtml(event.id)}" class="danger">Видалити</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function clearErrors() {
  for (const id of ["titleError", "dateError", "locationError", "capacityError", "descriptionError"]) {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  }
}

export function setFieldError(field, message) {
  const el = document.getElementById(`${field}Error`);
  if (el) el.textContent = message;
}

export function fillForm(event) {
  document.getElementById("editIdInput").value = event.id;
  document.getElementById("titleInput").value = event.title;
  document.getElementById("dateInput").value = event.date;
  document.getElementById("locationInput").value = event.location;
  document.getElementById("capacityInput").value = event.capacity;
  document.getElementById("descriptionInput").value = event.description || "";

  document.getElementById("formTitle").textContent = "Редагувати подію";
  document.getElementById("submitBtn").textContent = "Зберегти";
}

export function resetForm() {
  document.getElementById("eventForm").reset();
  document.getElementById("editIdInput").value = "";

  document.getElementById("formTitle").textContent = "Додати подію";
  document.getElementById("submitBtn").textContent = "Додати";

  clearErrors();
}