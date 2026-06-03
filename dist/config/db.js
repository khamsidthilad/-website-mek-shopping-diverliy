"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.sequelize = void 0;
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// Load env from project root by default (works regardless of build output dir)
dotenv_1.default.config({
    path: process.env.ENV_PATH || path_1.default.resolve(process.cwd(), ".env"),
});
function resolveDialect() {
    const configured = process.env.DB_DIALECT?.trim().toLowerCase();
    if (configured === "mysql" || configured === "postgres") {
        return configured;
    }
    const url = process.env.CONNECTION_STRING?.trim() ?? "";
    if (url.startsWith("postgres://"))
        return "postgres";
    if (url.startsWith("mysql://"))
        return "mysql";
    const port = process.env.DB_PORT?.trim();
    if (port === "5432")
        return "postgres";
    return "mysql";
}
function createSequelize() {
    const dialect = resolveDialect();
    const logging = process.env.DB_LOG_SQL === "true" ? console.log : false;
    const connectionString = process.env.CONNECTION_STRING?.trim();
    if (connectionString) {
        return new sequelize_1.Sequelize(connectionString, { dialect, logging });
    }
    const host = process.env.DB_HOST?.trim();
    const user = process.env.DB_USER?.trim();
    const database = process.env.DB_NAME?.trim();
    const password = process.env.DB_PASSWORD ?? "";
    const defaultPort = dialect === "postgres" ? "5432" : "3306";
    const port = Number(process.env.DB_PORT?.trim() || defaultPort);
    if (!host || !user || !database) {
        throw new Error("Database config incomplete: set CONNECTION_STRING or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and optionally DB_PORT, DB_DIALECT) in .env.");
    }
    return new sequelize_1.Sequelize(database, user, password, {
        host,
        port,
        dialect,
        logging,
    });
}
const sequelize = createSequelize();
exports.sequelize = sequelize;
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=db.js.map