# LabWork2 Backend

## Запуск

```bash
npm install
npm run dev
```

Сервер запускається на `http://localhost:3000`.

## Сутності

Проєкт має дві основні сутності:

- `events`
- `users`

Дані зберігаються в оперативній пам'яті через repository-класи.

## Маршрути

### Events

```http
GET /api/events
GET /api/events/:id
POST /api/events
PUT /api/events/:id
DELETE /api/events/:id
```

### Users

```http
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

## Додаткові query params для events

```http
GET /api/events?search=семінар&sortBy=date&sortDir=desc&page=1&pageSize=10
```

- `search` виконує фільтрацію за назвою, локацією або описом.
- `sortBy=date` сортує за датою.
- `sortDir=asc|desc` задає напрям сортування.
- `page` і `pageSize` відповідають за пагінацію.

## Формат списку

```json
{
  "items": [],
  "total": 0
}
```

## Формат помилки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Помилка валідації",
    "details": []
  }
}
```

## Основні HTTP-коди

- `200` — успішне отримання або оновлення.
- `201` — створення запису.
- `204` — успішне видалення без тіла відповіді.
- `400` — помилка валідації.
- `404` — ресурс або маршрут не знайдено.
- `500` — неочікувана помилка сервера.
