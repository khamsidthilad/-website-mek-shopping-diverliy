"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const api_routes_1 = __importDefault(require("./routes/api.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.testConnection)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
// Express 5 (path-to-regexp) does not accept bare '*'
app.options(/.*/, (0, cors_1.default)());
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/api', api_routes_1.default);
app.get('/', (req, res) => {
    res.send('Shop API Server is running');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map