import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/db.js'
import authRoutes from './routes/auth.js'
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import Cart from "./models/Cart.js";
import CartItem from "./models/CartItem.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import cartRoutes from "./routes/cart.js";
import Order from "./models/Order.js";
import OrderItem from "./models/OrderItem.js";
import Wallet from "./models/Wallet.js";
import WalletTransaction from "./models/WalletTransaction.js";
import walletRoutes from "./routes/wallet.js";
import deliveryCharge from "./routes/deliveryCharge.js";
import user from "./routes/user.js";
import bannerRoutes from "./routes/banners.js";
import Address from "./models/Address.js";
import addressRoutes from "./routes/address.js";
import razorpayRoutes from "./routes/razorpay.js";
import paymentsRoutes from "./routes/payments.js";
import Payment from "./models/Payment.js";
import BinaryNode from "./models/BinaryNode.js";
import Referral from "./models/Referral.js";
import referralRoutes from "./routes/referrals.js";
import binaryRoutes from "./routes/binary.js";
import ReferralLink from "./models/ReferralLink.js";
import ReferralEdge from "./models/ReferralEdge.js";
import referralTreeRoutes from "./routes/referralTree.js";
import settingsRoutes from "./routes/settings.js";
import AppSetting from "./models/AppSetting.js";
import PairMatch from "./models/PairMatch.js";
import "./models/PairPending.js";
import "./models/PairMatch.js";
import reportsRoutes from "./routes/reports.js";
import pairsRoutes from "./routes/pairs.js";
import withdrawalRoutes from "./routes/withdrawals.js";
import awardsRoutes from "./routes/awards.js";
import RankAchievement from "./models/RankAchievement.js";
import RankSetting from "./models/RankSetting.js";

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

sequelize.sync().then(() => console.log('MySQL connected'))

app.use("/uploads", express.static("uploads"));

/* =======================
   ✅ HEALTH CHECK API
========================== */
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      status: "SERVER_RUNNING",
      database: "CONNECTED",
      message: "All APIs are running successfully",
      apis: [
        "/api/auth",
        "/api/products",
        "/api/cart",
        "/api/orders",
        "/api/wallet",
        "/api/deliverycharges",
        "/api/users",
        "/api/banners",
        "/api/addresses",
        "/api/razorpay",
        "/api/payments",
        "/api/referrals",
        "/api/binary",
        "/api/settings",
        "/api/pairs",
        "/api/withdrawals",
        "/api/reports",
        "/api/awards"
      ],
      time: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: "SERVER_RUNNING",
      database: "DISCONNECTED",
      error: error.message
    });
  }
});

/* routes */
app.use('/api/auth', authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/deliverycharges", deliveryCharge);
app.use("/api/users", user);
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

/* relations */
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

Wallet.hasMany(WalletTransaction, { foreignKey: "walletId", onDelete: "CASCADE", as: "transactions" });
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

/* IMPORTANT: Use dynamic port */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
