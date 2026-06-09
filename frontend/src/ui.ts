import type { ApiError } from "./dtos.js";

export function renderListStatus(status: "loading" | "success" | "empty" | "error", error?: ApiError) {
  const el = document.getElementById("listStatus");
  if (!el) return;
  
  if (status === "loading") el.innerHTML = "Завантаження...";
  else if (status === "error") el.innerHTML = `Помилка: ${error?.message || "невідома"}`;
  else el.innerHTML = "";
}
export function renderList(items: any[]) {
  const el = document.getElementById("eventsTableBody");
  if (!el) return;
  el.innerHTML = items.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.title}</td>
      <td>${item.createdAt}</td>
      <td>${item.status}</td>
    </tr>
  `).join("");
}