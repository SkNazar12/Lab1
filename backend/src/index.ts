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
    console.log(`Events API: http://localhost:${PORT}/api/v1/events`);
    console.log(`Registrations API: http://localhost:${PORT}/api/v1/registrations`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
