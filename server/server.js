import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { sequelize } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import walletRoutes from "./routes/wallet.js";
import deliveryCharge from "./routes/deliveryCharge.js";
import userRoutes from "./routes/user.js";
import bannerRoutes from "./routes/banners.js";
import addressRoutes from "./routes/address.js";
import razorpayRoutes from "./routes/razorpay.js";
import paymentsRoutes from "./routes/payments.js";
import referralRoutes from "./routes/referrals.js";
import binaryRoutes from "./routes/binary.js";
import settingsRoutes from "./routes/settings.js";
import pairsRoutes from "./routes/pairs.js";
import withdrawalRoutes from "./routes/withdrawals.js";
import reportsRoutes from "./routes/reports.js";
import awardsRoutes from "./routes/awards.js";

/* models */
import Cart from "./models/Cart.js";
import CartItem from "./models/CartItem.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import OrderItem from "./models/OrderItem.js";
import Wallet from "./models/Wallet.js";
import WalletTransaction from "./models/WalletTransaction.js";
import Address from "./models/Address.js";
import Payment from "./models/Payment.js";
import Referral from "./models/Referral.js";
import BinaryNode from "./models/BinaryNode.js";
import ReferralLink from "./models/ReferralLink.js";
import ReferralEdge from "./models/ReferralEdge.js";
import PairMatch from "./models/PairMatch.js";
import "./models/PairPending.js";
import AppSetting from "./models/AppSetting.js";
import RankAchievement from "./models/RankAchievement.js";
import RankSetting from "./models/RankSetting.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* middleware */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

/* ✅ health check */
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      ok: true,
      message: "API is running ✅",
      db: "connected",
      time: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      message: "API running but DB error ❌",
      error: e?.message || String(e),
    });
  }
});

/* =========================
   Associations (BEFORE sync)
   ========================= */

Cart.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Cart, { foreignKey: "userId" });

Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

CartItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(CartItem, { foreignKey: "productId" });

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

Wallet.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Wallet, { foreignKey: "userId" });

Wallet.hasMany(WalletTransaction, {
  foreignKey: "walletId",
  onDelete: "CASCADE",
  as: "transactions",
});
WalletTransaction.belongsTo(Wallet, { foreignKey: "walletId", as: "wallet" });

User.hasMany(Address, { foreignKey: "userId", as: "addresses", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId", as: "user" });

Order.belongsTo(Address, { foreignKey: "addressId" });
Address.hasMany(Order, { foreignKey: "addressId" });

Payment.belongsTo(User, { foreignKey: "userId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });
Order.hasMany(Payment, { foreignKey: "orderId" });
User.hasMany(Payment, { foreignKey: "userId" });

ReferralLink.belongsTo(User, { foreignKey: "sponsorId" });

Referral.belongsTo(User, { foreignKey: "sponsorId", as: "sponsor" });
Referral.belongsTo(User, { foreignKey: "referredUserId", as: "referredUser" });

ReferralEdge.belongsTo(User, { foreignKey: "sponsorId", as: "sponsor" });
ReferralEdge.belongsTo(User, { foreignKey: "childId", as: "child" });

RankAchievement.belongsTo(User, { foreignKey: "userId" });
User.hasMany(RankAchievement, { foreignKey: "userId" });

/* =========================
   Routes
   ========================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/deliverycharges", deliveryCharge);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/binary", binaryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/pairs", pairsRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/awards", awardsRoutes);

/* =========================
   DB init + start
   ========================= */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    // ✅ safer than alter:true on hosting
    await sequelize.sync();
    console.log("✅ Models synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();