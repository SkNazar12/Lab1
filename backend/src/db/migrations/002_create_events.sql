CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  description TEXT,
  createdAt TEXT NOT NULL
);
