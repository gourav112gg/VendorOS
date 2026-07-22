const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SuperAdmin = require("../src/models/SuperAdmin");

const seedAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSPHRASE, MONGO_URI } = process.env;

    if (!MONGO_URI) {
      console.error("❌ ERROR: MONGO_URI environment variable is missing.");
      process.exit(1);
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PASSPHRASE) {
      console.error("❌ ERROR: Required admin credentials environment variables are missing.");
      console.error("Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PASSPHRASE in your .env environment.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Idempotency check — refusal if any admin exists
    const existingAdmin = await SuperAdmin.findOne();
    if (existingAdmin) {
      console.error(`❌ REFUSAL: A Super Admin account already exists (${existingAdmin.email}).`);
      console.error("No duplicate admin accounts can be created per system security policy.");
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("Hashing credentials with bcrypt...");
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD.trim(), saltRounds);
    const passphraseHash = await bcrypt.hash(ADMIN_PASSPHRASE.trim(), saltRounds);

    const admin = await SuperAdmin.create({
      email: ADMIN_EMAIL.trim().toLowerCase(),
      passwordHash,
      passphraseHash,
    });

    console.log(`✅ SUCCESS: Super Admin account created successfully!`);
    console.log(`Admin ID: ${admin._id}`);
    console.log(`Admin Email: ${admin.email}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Seeding Error:", error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
