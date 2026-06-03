import winston from 'winston';
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const logError: (message: string, error: any, meta?: any) => void;
export declare const logInfo: (message: string, meta?: any) => void;
export declare const logWarning: (message: string, meta?: any) => void;
export declare const logDebug: (message: string, meta?: any) => void;
export declare const createTimer: (operation: string) => {
    end: () => number;
};
declare const _default: {
    logger: winston.Logger;
    requestLogger: (req: any, res: any, next: any) => void;
    logError: (message: string, error: any, meta?: any) => void;
    logInfo: (message: string, meta?: any) => void;
    logWarning: (message: string, meta?: any) => void;
    logDebug: (message: string, meta?: any) => void;
    createTimer: (operation: string) => {
        end: () => number;
    };
};
export default _default;
//# sourceMappingURL=logger.d.ts.map