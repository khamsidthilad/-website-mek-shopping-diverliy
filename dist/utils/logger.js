"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimer = exports.logDebug = exports.logWarning = exports.logInfo = exports.logError = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message} ${info.stack || ''}`));
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'shop-api' },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log')
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log')
        })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
        const userId = req.user ? req.user.id : 'anonymous';
        logger.info({
            message,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration,
            userId,
            ip: req.ip
        });
        if (res.statusCode >= 400) {
            logger.warn({
                message: `Error response: ${message}`,
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration,
                userId,
                ip: req.ip,
                body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
                query: Object.keys(req.query).length ? JSON.stringify(req.query) : undefined
            });
        }
    });
    next();
};
exports.requestLogger = requestLogger;
const logError = (message, error, meta = {}) => {
    logger.error({
        message,
        error: error.message,
        stack: error.stack,
        ...meta
    });
};
exports.logError = logError;
const logInfo = (message, meta = {}) => {
    logger.info({
        message,
        ...meta
    });
};
exports.logInfo = logInfo;
const logWarning = (message, meta = {}) => {
    logger.warn({
        message,
        ...meta
    });
};
exports.logWarning = logWarning;
const logDebug = (message, meta = {}) => {
    logger.debug({
        message,
        ...meta
    });
};
exports.logDebug = logDebug;
const createTimer = (operation) => {
    const start = Date.now();
    return {
        end: () => {
            const duration = Date.now() - start;
            (0, exports.logInfo)(`${operation} completed in ${duration}ms`, { duration, operation });
            return duration;
        }
    };
};
exports.createTimer = createTimer;
exports.default = {
    logger,
    requestLogger: exports.requestLogger,
    logError: exports.logError,
    logInfo: exports.logInfo,
    logWarning: exports.logWarning,
    logDebug: exports.logDebug,
    createTimer: exports.createTimer
};
//# sourceMappingURL=logger.js.map