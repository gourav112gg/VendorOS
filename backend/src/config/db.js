const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy conflicting unique indexes if they exist
    try {
      await conn.connection.db.collection("users").dropIndex("phone_1");
      console.log("ℹ️ Dropped legacy unique index 'phone_1' to enable multiple profiles");
    } catch (e) {}

    try {
      await conn.connection.db.collection("users").dropIndex("email_1");
      console.log("ℹ️ Dropped legacy unique index 'email_1' to enable multiple profiles");
    } catch (e) {}

  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;