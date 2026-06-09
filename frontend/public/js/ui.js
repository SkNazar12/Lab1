function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text ?? "";
  return td;
}

function createButton(text, action, id, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = String(id);

  if (className) {
    button.className = className;
  }

  return button;
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

  tbody.replaceChildren();

  for (const event of events) {
    const tr = document.createElement("tr");

    tr.append(
      createCell(String(event.id)),
      createCell(event.title),
      createCell(event.date),
      createCell(event.location),
      createCell(`${event.registrationsCount ?? 0}/${event.capacity}`),
      createCell(event.description || "—")
    );

    const actionsTd = document.createElement("td");
    actionsTd.className = "actions";

    actionsTd.append(
      createButton("Зареєструвати", "register", event.id),
      createButton("Редагувати", "edit", event.id),
      createButton("Видалити", "delete", event.id, "danger")
    );

    tr.append(actionsTd);
    tbody.appendChild(tr);
  }
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