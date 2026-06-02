import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load env from project root by default (works regardless of build output dir)
dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), ".env"),
});

const connectionString = process.env.CONNECTION_STRING?.trim() ?? "";

if (!connectionString) {
  console.warn(
    "Database config incomplete: set CONNECTION_STRING in .env (project root).",
  );
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: process.env.DB_LOG_SQL === "true" ? console.log : false,
});

const testConnection = async () => {
  try {
    if (!connectionString) {
      throw new Error("Missing CONNECTION_STRING in .env");
    }
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, testConnection };
