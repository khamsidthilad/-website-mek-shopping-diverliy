import * as models from "../models";
import { logInfo, logError } from "./logger";
import dotenv from "dotenv";
import { sequelize } from "../config/db";
import User from "../models/user.model";
import {
  BillSellDetail,
  Customer,
  Order,
  Product,
  Supplier,
  Purchase,
  Diverily,
} from "../models";
import Category from "../models/category.model";

dotenv.config();

export const syncDatabase = async (
  force: boolean = false,
  alter: boolean = true,
): Promise<void> => {
  try {
    console.log("🔄 Synchronizing database...");

    // Sync tables in FK-safe order and seed parent tables first.
    await Category.sync({ alter, force });
    await createDefaultCategories();

    await Customer.sync({ alter, force });
    await createMockCustomers();

    await Product.sync({ alter, force });
    await createMockProducts();

    await Supplier.sync({ alter, force });
    await createMockSuppliers();
    await Order.sync({ alter, force });
    await BillSellDetail.sync({ alter, force });
    await User.sync({ alter, force });
    await createDefaultAdminUser();
    await Purchase.sync({ alter, force });

    await Diverily.sync({ alter, force });
    await createMockDiverily();

    console.log("✅ Database synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to synchronize database:", error);
    process.exit(1);
  }
};

const createDefaultAdminUser = async (): Promise<void> => {
  try {
    const { User } = models;
    const adminExists = await User.findOne({ where: { role: "admin" } });

    if (adminExists) {
      logInfo("Admin user already exists, skipping creation");
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

    logInfo("Default admin user created", {
      userId: defaultAdmin.User_id,
      username: defaultAdmin.Email,
    });
  } catch (error) {
    logError("Error creating default admin user", error);
  }
};

const createMockCustomers = async (): Promise<void> => {
  try {
    const count = await Customer.count();
    if (count > 0) {
      logInfo("Customers already exist, skipping mock data.");
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

    await Customer.bulkCreate(customers);
    logInfo("Mock customers created", { count: customers.length });
  } catch (error) {
    logError("Error creating mock customers", error);
  }
};

const createMockProducts = async (): Promise<void> => {
  try {
    const count = await Product.count();
    if (count > 0) {
      logInfo("Products already exist, skipping mock data.");
      return;
    }

    const products = [
      { pro_name: "รองเท้าผ้าใบ", pro_price: 1200, cate_id: 1 },
      { pro_name: "เสื้อยืดแฟชั่น", pro_price: 450, cate_id: 2 },
      { pro_name: "ไม้แบดมินตัน", pro_price: 900, cate_id: 3 },
      { pro_name: "หูฟังไร้สาย", pro_price: 1500, cate_id: 4 },
    ];

    await Product.bulkCreate(products);
    logInfo("Mock products created", { count: products.length });
  } catch (error) {
    logError("Error creating mock products", error);
  }
};

const createDefaultCategories = async (): Promise<void> => {
  try {
    const { Category } = models;
    const categoriesExist = await Category.count();

    if (categoriesExist > 0) {
      logInfo("Categories already exist, skipping creation");
      return;
    }

    const defaultCategories = [
      { cate_name: "รองเท้า" },
      { cate_name: "เสื้อผ้า" },
      { cate_name: "อุปกรณ์กีฬา" },
      { cate_name: "อิเล็กทรอนิกส์" },
    ];

    await Category.bulkCreate(defaultCategories);
    logInfo("Default categories created", { count: defaultCategories.length });
  } catch (error) {
    logError("Error creating default categories", error);
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

const createMockSuppliers = async (): Promise<void> => {
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
      const [, created] = await Supplier.findOrCreate({
        where: { Tel: s.Tel },
        defaults: s,
      });
      if (created) createdCount += 1;
    }

    logInfo("Mock suppliers seeded", {
      requested: defaultsuppliers.length,
      created: createdCount,
    });
  } catch (error) {
    logError("Error creating mock suppliers", error);
  }
};

const createMockDiverily = async (): Promise<void> => {
  try {
    const count = await Diverily.count();
    if (count > 0) {
      logInfo("Delivery records already exist, skipping mock data.");
      return;
    }

    const users = await User.findAll({
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

    await Diverily.bulkCreate(deliveries);
    logInfo("Mock delivery records created", { count: deliveries.length });
  } catch (error) {
    logError("Error creating mock delivery records", error);
  }
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const alter = args.includes("--alter") || !force;

  syncDatabase(force, alter)
    .then(() => {
      console.log("Database synchronization completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database synchronization failed:", error);
      process.exit(1);
    });
}

export default syncDatabase;
