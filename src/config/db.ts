import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load env from project root by default (works regardless of build output dir)
dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), ".env"),
});

const dbName = process.env.DB_NAME?.trim() ?? "";
const dbUser = process.env.DB_USER?.trim() ?? "";
const dbPass = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "";
const dbHost = process.env.DB_HOST?.trim() || "localhost";
const dbPortRaw = Number(process.env.DB_PORT);
const dbPort = Number.isFinite(dbPortRaw) && dbPortRaw > 0 ? dbPortRaw : 3306;

if (!dbName || !dbUser) {
  // Avoid crashing during import; `testConnection()` will surface a clear error.
  console.warn(
    "Database config incomplete: set DB_NAME and DB_USER in .env (project root).",
  );
}

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: process.env.DB_LOG_SQL === "true" ? console.log : false,
});

const testConnection = async () => {
  try {
    if (!dbName || !dbUser) {
      throw new Error("Missing DB_NAME/DB_USER in .env");
    }
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, testConnection };
