const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

async function resetPasswords() {
  try {
    const newPassword = process.env.NEW_PASSWORD || process.argv[2];
    if (!newPassword || newPassword.length < 8) {
      console.error("❌ ERROR: Please supply a secure password via NEW_PASSWORD env variable or CLI argument (min 8 chars).");
      process.exit(1);
    }

    if (!process.env.MONGO_URI) {
      console.error("❌ ERROR: MONGO_URI environment variable is missing.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Reset Manager Password
    const manager = await User.findOne({ role: "manager" });
    if (manager) {
      manager.password = hashedPassword;
      await manager.save();
      console.log(`✅ Manager (${manager.email}) password reset.`);
    } else {
      console.log("❌ Manager not found");
    }

    // Reset Worker Password
    const worker = await User.findOne({ role: "worker" });
    if (worker) {
      worker.password = hashedPassword;
      await worker.save();
      console.log(`✅ Worker (${worker.email}) password reset.`);
    } else {
      console.log("❌ Worker not found");
    }

    console.log("🎉 Done!");
    process.exit(0);
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  resetPasswords();
}

module.exports = resetPasswords;