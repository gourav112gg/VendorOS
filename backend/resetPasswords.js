const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Reset Manager Password
    const manager = await User.findOne({ role: "manager" });

    if (manager) {
      manager.password = await bcrypt.hash("rahul123", 10);
      await manager.save();
      console.log("✅ Manager password reset to: rahul123");
    } else {
      console.log("❌ Manager not found");
    }

    // Reset Worker Password
    const worker = await User.findOne({ role: "worker" });

    if (worker) {
      worker.password = await bcrypt.hash("amit123", 10);
      await worker.save();
      console.log("✅ Worker password reset to: amit123");
    } else {
      console.log("❌ Worker not found");
    }

    console.log("🎉 Done!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();