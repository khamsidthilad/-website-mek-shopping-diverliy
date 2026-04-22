import winston from 'winston';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message} ${info.stack || ''}`
    )
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'shop-api' },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log')
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log')
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );
}

export const requestLogger = (req: any, res: any, next: any) => {
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

export const logError = (message: string, error: any, meta: any = {}) => {
    logger.error({
        message,
        error: error.message,
        stack: error.stack,
        ...meta
    });
};

export const logInfo = (message: string, meta: any = {}) => {
    logger.info({
        message,
        ...meta
    });
};

export const logWarning = (message: string, meta: any = {}) => {
    logger.warn({
        message,
        ...meta
    });
};

export const logDebug = (message: string, meta: any = {}) => {
    logger.debug({
        message,
        ...meta
    });
};

export const createTimer = (operation: string) => {
    const start = Date.now();
    return {
        end: () => {
            const duration = Date.now() - start;
            logInfo(`${operation} completed in ${duration}ms`, { duration, operation });
            return duration;
        }
    };
};

export default {
    logger,
    requestLogger,
    logError,
    logInfo,
    logWarning,
    logDebug,
    createTimer
};
