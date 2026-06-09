import { API_BASE_URL } from "./config.js";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response;

  try {
    response = await fetch(url, options);
  } catch (err) {
    throw {
      status: 0,
      message: "Помилка мережі або CORS. Перевір, чи запущений backend.",
      details: err?.message || String(err)
    };
  }

  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();

  let payload = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message:
        payload?.error?.message ||
        payload?.message ||
        `HTTP error ${response.status}`,
      details: payload
    };
  }

  return payload;
}

export function getEvents(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  searchParams.set("limit", "100");

  const query = searchParams.toString();

  return request(`/events${query ? `?${query}` : ""}`);
}

export function createEvent(dto) {
  return request("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dto)
  });
}

export function updateEvent(id, dto) {
  return request(`/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dto)
  });
}

export function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: "DELETE"
  });
}

export function registerUser(eventId, userId) {
  return request(`/events/${eventId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Demo-UserId": String(userId)
    }
  });
}

export function getMyRegistrations(userId) {
  return request("/registrations/me", {
    method: "GET",
    headers: {
      "X-Demo-UserId": String(userId)
    }
  });
}