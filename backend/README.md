# LabWork3 — SQLite backend

Ця робота є прямим продовженням LabWork2 і логічним попередником фінальної роботи.

- У LabWork2 події та користувачі зберігались у пам'яті застосунку.
- У LabWork3 ті самі сутності перенесені в SQLite, додано таблицю реєстрацій, міграції, seed, JOIN, агрегацію та навчальну демонстрацію SQL injection.
- У фінальній роботі ця ж предметна область розвивається далі: SQL-запити мають бути параметризовані, а API доповнюється захисними middleware.

## Запуск

```bash
node -v  # потрібен Node.js 22.5+
npm install
npm run build
npm start
```

Для запуску в режимі розробки:

```bash
npm run dev
```

Для seed-даних:

```bash
npm run seed
```

SQLite-файл створюється автоматично у папці:

```text
data/app.db
```

Цей файл не додається в git. Для цього у `.gitignore` є правила:

```text
data/
*.db
*.db-journal
```

## Схема БД

### Users

| Поле | Тип | Обмеження |
|---|---|---|
| id | INTEGER | PRIMARY KEY |
| email | TEXT | NOT NULL, UNIQUE |
| name | TEXT | NOT NULL |
| createdAt | TEXT | NOT NULL |

### Events

| Поле | Тип | Обмеження |
|---|---|---|
| id | INTEGER | PRIMARY KEY |
| title | TEXT | NOT NULL |
| date | TEXT | NOT NULL |
| location | TEXT | NOT NULL |
| capacity | INTEGER | NOT NULL, CHECK(capacity > 0) |
| description | TEXT | nullable |
| createdAt | TEXT | NOT NULL |

### Registrations

| Поле | Тип | Обмеження |
|---|---|---|
| id | INTEGER | PRIMARY KEY |
| eventId | INTEGER | NOT NULL, FK -> Events(id) |
| userId | INTEGER | NOT NULL, FK -> Users(id) |
| registeredAt | TEXT | NOT NULL |

Додаткове обмеження:

```sql
UNIQUE(eventId, userId)
```

Це не дозволяє одному користувачу зареєструватися на ту саму подію двічі.

## Зв'язки

```text
Users 1:N Registrations
Events 1:N Registrations
```

Фактично через `Registrations` реалізується зв'язок багато-до-багатьох між користувачами та подіями.

## Міграції

Міграції зберігаються у:

```text
src/db/migrations/
```

Є таблиця:

```text
schema_migrations
```

Вона фіксує вже застосовані SQL-файли. При старті застосунок виконує тільки ті міграції, яких ще немає в `schema_migrations`.

## Основні endpoints

### Users

```text
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Events

```text
GET    /api/v1/events
GET    /api/v1/events/:id
POST   /api/v1/events
PUT    /api/v1/events/:id
DELETE /api/v1/events/:id
POST   /api/v1/events/:id/register
```

### Registrations

```text
GET    /api/v1/registrations
GET    /api/v1/registrations/me
GET    /api/v1/registrations/:id
POST   /api/v1/registrations
PUT    /api/v1/registrations/:id
PATCH  /api/v1/registrations/:id/my-event
DELETE /api/v1/registrations/:id
```

## JOIN endpoint

Список подій повертає події разом із кількістю реєстрацій та кількістю вільних місць:

```text
GET /api/v1/events?sort=date&order=desc&limit=10
```

У SQL використовується `LEFT JOIN` між `Events` і `Registrations`.

## Endpoint з агрегацією

```text
GET /api/v1/events/stats
```

Використовує `COUNT`, `SUM`, `AVG` і повертає статистику по подіях та реєстраціях.

## Демонстрація SQL injection

```text
GET /api/v1/events/search?q=workshop
```

Цей endpoint спеціально залишений небезпечним для навчальної демонстрації. Він формує SQL через рядкову конкатенацію:

```ts
WHERE title LIKE '%${q}%'
```

Це небезпечно, бо користувацький ввід може змінити логіку SQL-запиту. Приклад поганого вводу:

```text
' OR 1=1 --
```

У фінальній роботі такий код треба замінити параметризованими запитами.

## Приклади запитів

Створити користувача:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new.student@knu.ua","name":"Maria"}'
```

Отримати список подій із сортуванням і лімітом:

```bash
curl "http://localhost:3000/api/v1/events?sort=date&order=desc&limit=5"
```

Пошук подій:

```bash
curl "http://localhost:3000/api/v1/events?q=web&sort=date&order=asc&limit=10"
```

Реєстрація поточного demo-користувача на подію:

```bash
curl -X POST http://localhost:3000/api/v1/events/3/register \
  -H "X-Demo-UserId: 1"
```

Отримати мої реєстрації:

```bash
curl http://localhost:3000/api/v1/registrations/me \
  -H "X-Demo-UserId: 1"
```

## HTTP-коди

| Ситуація | Код |
|---|---|
| Створення | 201 |
| Некоректні дані | 400 |
| Не авторизовано demo-користувача | 401 |
| Немає доступу | 403 |
| Ресурс не знайдено | 404 |
| Дубль UNIQUE або немає місць | 409 |
| Інша помилка | 500 |
