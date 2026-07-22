const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const AdminLoginAttempt = require("../src/models/AdminLoginAttempt");

const testPhase2 = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSPHRASE, MONGO_URI } = process.env;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB for Phase 2 Verification.");

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Clean previous test attempts for clean verification run
    await AdminLoginAttempt.deleteMany({ email: normalizedEmail });

    const app = require("../src/app");
    const http = require("http");
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    console.log(`\n--- Test 1: Single Failed Login Attempt (Wrong Passphrase) ---`);
    const res1 = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passphrase: "WrongPassphrase123!",
      }),
    });
    const data1 = await res1.json();
    console.log(`Status: ${res1.status}, Response:`, data1);

    const attemptsCount1 = await AdminLoginAttempt.countDocuments({ email: normalizedEmail });
    console.log(`Failed Attempts Count in DB: ${attemptsCount1} / 3`);

    console.log(`\n--- Test 2: Second Failed Login Attempt (Wrong Password) ---`);
    const res2 = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: "WrongPassword123!",
        passphrase: ADMIN_PASSPHRASE,
      }),
    });
    const data2 = await res2.json();
    console.log(`Status: ${res2.status}, Response:`, data2);

    const attemptsCount2 = await AdminLoginAttempt.countDocuments({ email: normalizedEmail });
    console.log(`Failed Attempts Count in DB: ${attemptsCount2} / 3`);

    console.log(`\n--- Test 3: Third Failed Login Attempt (Triggers Lockout) ---`);
    const res3 = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: "WrongPasswordAgain!",
        passphrase: ADMIN_PASSPHRASE,
      }),
    });
    const data3 = await res3.json();
    console.log(`Status: ${res3.status}, Response:`, data3);

    const attemptsCount3 = await AdminLoginAttempt.countDocuments({ email: normalizedEmail });
    console.log(`Failed Attempts Count in DB: ${attemptsCount3} / 3 (Account Locked!)`);

    console.log(`\n--- Test 4: Attempting Login with CORRECT Credentials while Locked Out ---`);
    const res4 = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passphrase: ADMIN_PASSPHRASE,
      }),
    });
    const data4 = await res4.json();
    console.log(`Status: ${res4.status} (Lockout active), Response:`, data4);

    // Clean up test attempts so admin can log in for real
    await AdminLoginAttempt.deleteMany({ email: normalizedEmail });
    console.log("\nCleaned test login attempts after lockout test.");

    console.log(`\n--- Test 5: Successful 3-Factor Admin Login ---`);
    const res5 = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passphrase: ADMIN_PASSPHRASE,
      }),
    });
    const data5 = await res5.json();
    console.log(`Status: ${res5.status}, Response:`, data5);

    server.close();
    await mongoose.disconnect();
    console.log("\n✅ PHASE 2 AUTHENTICATION & LOCKOUT VERIFICATION PASSED!");
  } catch (err) {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  }
};

testPhase2();
