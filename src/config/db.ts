import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load env from project root by default (works regardless of build output dir)
dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), ".env"),
});

type DbDialect = "mysql" | "postgres";

function resolveDialect(): DbDialect {
  const configured = process.env.DB_DIALECT?.trim().toLowerCase();
  if (configured === "mysql" || configured === "postgres") {
    return configured;
  }

  const url = process.env.CONNECTION_STRING?.trim() ?? "";
  if (url.startsWith("postgres://")) return "postgres";
  if (url.startsWith("mysql://")) return "mysql";

  const port = process.env.DB_PORT?.trim();
  if (port === "5432") return "postgres";

  return "mysql";
}

function createSequelize(): Sequelize {
  const dialect = resolveDialect();
  const logging = process.env.DB_LOG_SQL === "true" ? console.log : false;
  const connectionString = process.env.CONNECTION_STRING?.trim();

  if (connectionString) {
    return new Sequelize(connectionString, { dialect, logging });
  }

  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const database = process.env.DB_NAME?.trim();
  const password = process.env.DB_PASSWORD ?? "";
  const defaultPort = dialect === "postgres" ? "5432" : "3306";
  const port = Number(process.env.DB_PORT?.trim() || defaultPort);

  if (!host || !user || !database) {
    throw new Error(
      "Database config incomplete: set CONNECTION_STRING or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and optionally DB_PORT, DB_DIALECT) in .env.",
    );
  }

  return new Sequelize(database, user, password, {
    host,
    port,
    dialect,
    logging,
  });
}

const sequelize = createSequelize();

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, testConnection };


// PORT=3003
// NODE_ENV=development

// DB_HOST=127.0.0.1
// DB_PORT=5432
// DB_USER=postgres
// DB_PASSWORD=Dev234miler
// DB_NAME=naruto


// JWT_SECRET=(POS123;
// JWT_EXPIRES_IN=1d
// EMAIL_HOST=sandbox.smtp.mailtrap.io
// EMAIL_PORT=2525
// EMAIL_USER=0e4451930cbc9d
// EMAIL_PASS=8414b237fa3aba
// EMAIL_FROM=black13131303@gmail.com
// SHOP_NAME=Online Shop
// # File upload limits
// MAX_FILE_SIZE=10485760 # 10MB

// CONNECTION_STRING=postgresql://postgres:Dev234miler@127.0.0.1:5432/naruto