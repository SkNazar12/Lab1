import { API_BASE_URL } from "./config.js";
import type { ApiError } from "./dtos.js";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, options);
    
    // Окремо обробляємо 204 No Content
    if (response.status === 204) return null as unknown as T;

    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, message: data.message || "HTTP помилка", details: data.details } as ApiError;
    }
    return data;
  } catch (e: any) {
    throw { status: 0, message: "Помилка мережі або CORS", details: e.message } as ApiError;
  }
}

export const getList = () => request<any[]>("/tickets");
export const create = (dto: any) => request<any>("/tickets", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(dto)
});