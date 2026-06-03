"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = void 0;
const models = __importStar(require("../models"));
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../models/user.model"));
const models_1 = require("../models");
const category_model_1 = __importDefault(require("../models/category.model"));
dotenv_1.default.config();
const syncDatabase = async (force = false, alter = true) => {
    try {
        console.log("🔄 Synchronizing database...");
        // Sync tables in FK-safe order and seed parent tables first.
        await category_model_1.default.sync({ alter, force });
        await createDefaultCategories();
        await models_1.Customer.sync({ alter, force });
        await createMockCustomers();
        await models_1.Product.sync({ alter, force });
        await createMockProducts();
        await models_1.Supplier.sync({ alter, force });
        await createMockSuppliers();
        await models_1.Order.sync({ alter, force });
        await models_1.BillSellDetail.sync({ alter, force });
        await user_model_1.default.sync({ alter, force });
        await createDefaultAdminUser();
        await models_1.Purchase.sync({ alter, force });
        await models_1.Diverily.sync({ alter, force });
        await createMockDiverily();
        console.log("✅ Database synchronized successfully.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Failed to synchronize database:", error);
        process.exit(1);
    }
};
exports.syncDatabase = syncDatabase;
const createDefaultAdminUser = async () => {
    try {
        const { User } = models;
        const adminExists = await User.findOne({ where: { role: "admin" } });
        if (adminExists) {
            (0, logger_1.logInfo)("Admin user already exists, skipping creation");
            return;
        }
        const defaultAdmin = await User.create({
            User_id: "ADMIN00001",
            Full_Name: "Admin User",
            Date_of_birth: null,
            Email: process.env.ADMIN_EMAIL || "admin@example.com",
            password: process.env.ADMIN_PASSWORD || "admin123",
            status: "active",
            tel: null,
            image: null,
            role: "admin",
        });
        (0, logger_1.logInfo)("Default admin user created", {
            userId: defaultAdmin.User_id,
            username: defaultAdmin.Email,
        });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating default admin user", error);
    }
};
const createMockCustomers = async () => {
    try {
        const count = await models_1.Customer.count();
        if (count > 0) {
            (0, logger_1.logInfo)("Customers already exist, skipping mock data.");
            return;
        }
        const customers = [
            {
                cus_name: "สมชาย ใจดี",
                Tel: "0801234567",
                address: "กรุงเทพฯ",
                cus_status: "active",
                Email: "somchai.mock@example.com",
            },
            {
                cus_name: "สมหญิง สุดสวย",
                Tel: "0812345678",
                address: "เชียงใหม่",
                cus_status: "active",
                Email: "somying.mock@example.com",
            },
        ];
        await models_1.Customer.bulkCreate(customers);
        (0, logger_1.logInfo)("Mock customers created", { count: customers.length });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating mock customers", error);
    }
};
const createMockProducts = async () => {
    try {
        const count = await models_1.Product.count();
        if (count > 0) {
            (0, logger_1.logInfo)("Products already exist, skipping mock data.");
            return;
        }
        const products = [
            { pro_name: "รองเท้าผ้าใบ", pro_price: 1200, cate_id: 1 },
            { pro_name: "เสื้อยืดแฟชั่น", pro_price: 450, cate_id: 2 },
            { pro_name: "ไม้แบดมินตัน", pro_price: 900, cate_id: 3 },
            { pro_name: "หูฟังไร้สาย", pro_price: 1500, cate_id: 4 },
        ];
        await models_1.Product.bulkCreate(products);
        (0, logger_1.logInfo)("Mock products created", { count: products.length });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating mock products", error);
    }
};
const createDefaultCategories = async () => {
    try {
        const { Category } = models;
        const categoriesExist = await Category.count();
        if (categoriesExist > 0) {
            (0, logger_1.logInfo)("Categories already exist, skipping creation");
            return;
        }
        const defaultCategories = [
            { cate_name: "รองเท้า" },
            { cate_name: "เสื้อผ้า" },
            { cate_name: "อุปกรณ์กีฬา" },
            { cate_name: "อิเล็กทรอนิกส์" },
        ];
        await Category.bulkCreate(defaultCategories);
        (0, logger_1.logInfo)("Default categories created", { count: defaultCategories.length });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating default categories", error);
    }
};
// const createDefaultGenerations = async (): Promise<void> => {
//   try {
//     const generationsExist = await Generation.count();
//     if (generationsExist > 0) {
//       logInfo("Generations already exist, skipping creation");
//       return;
//     }
//     const defaultGenerations = [
//       { gen_name: "รุ่นที่ 1", gen_remark: "รุ่นแรก" },
//       { gen_name: "รุ่นที่ 2", gen_remark: "รุ่นล่าสุด" },
//     ];
//     await Generation.bulkCreate(defaultGenerations);
//     logInfo("Default generations created", {
//       count: defaultGenerations.length,
//     });
//   } catch (error) {
//     logError("Error creating default generations", error);
//   }
// };
const createMockSuppliers = async () => {
    try {
        const defaultsuppliers = [
            {
                name: "บริษัท สำนักงานขายสินค้า",
                Tel: "0801234567",
                address: "กรุงเทพฯ",
            },
            {
                name: "บริษัท สำนักงานขายสินค้า",
                Tel: "0801234568",
                address: "เชียงใหม่",
            },
            {
                name: "บริษัท สำนักงานขายสินค้า",
                Tel: "0801234569",
                address: "ขอนแก่น",
            },
        ];
        let createdCount = 0;
        for (const s of defaultsuppliers) {
            const [, created] = await models_1.Supplier.findOrCreate({
                where: { Tel: s.Tel },
                defaults: s,
            });
            if (created)
                createdCount += 1;
        }
        (0, logger_1.logInfo)("Mock suppliers seeded", {
            requested: defaultsuppliers.length,
            created: createdCount,
        });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating mock suppliers", error);
    }
};
const createMockDiverily = async () => {
    try {
        const count = await models_1.Diverily.count();
        if (count > 0) {
            (0, logger_1.logInfo)("Delivery records already exist, skipping mock data.");
            return;
        }
        const users = await user_model_1.default.findAll({
            attributes: ["User_id"],
            order: [["createdAt", "ASC"]],
            limit: 2,
        });
        const firstUserId = users[0]?.User_id ?? null;
        const secondUserId = users[1]?.User_id ?? firstUserId ?? null;
        const deliveries = [
            { user_id: firstUserId },
            { user_id: secondUserId },
            { user_id: null },
        ];
        await models_1.Diverily.bulkCreate(deliveries);
        (0, logger_1.logInfo)("Mock delivery records created", { count: deliveries.length });
    }
    catch (error) {
        (0, logger_1.logError)("Error creating mock delivery records", error);
    }
};
if (require.main === module) {
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const alter = args.includes("--alter") || !force;
    (0, exports.syncDatabase)(force, alter)
        .then(() => {
        console.log("Database synchronization completed.");
        process.exit(0);
    })
        .catch((error) => {
        console.error("Database synchronization failed:", error);
        process.exit(1);
    });
}
exports.default = exports.syncDatabase;
//# sourceMappingURL=syncDatabase.js.map