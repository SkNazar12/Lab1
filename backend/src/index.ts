import { app } from "./app.js";
import { migrate } from "./db/migrate.js";
import { seedIfEmpty } from "./db/seed.js";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  await migrate();
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`Backend started: http://localhost:${PORT}`);
    console.log(`Healthcheck: http://localhost:${PORT}/health`);
    console.log(`Tickets API: http://localhost:${PORT}/api/v1/tickets`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});