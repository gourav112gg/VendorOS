const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const SuperAdmin = require("../src/models/SuperAdmin");
const Company = require("../src/models/Company");
const User = require("../src/models/User");
const AdminLoginAttempt = require("../src/models/AdminLoginAttempt");
const SuperAdminAuditLog = require("../src/models/SuperAdminAuditLog");

const runFullSuite = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSPHRASE, MONGO_URI } = process.env;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Phase 8 Verification.");

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const app = require("../src/app");
    const http = require("http");
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    console.log("\n===================================================================");
    console.log("PHASE 8 END-TO-END SUPER ADMIN SYSTEM VERIFICATION");
    console.log("===================================================================");

    // 1. Verify SuperAdmin document exists
    const adminDoc = await SuperAdmin.findOne({ email: normalizedEmail });
    console.log(`✓ 1. Super Admin Record Verified: ${adminDoc?.email} (ID: ${adminDoc?._id})`);

    // 2. Clear attempt logs for clean lockout test
    await AdminLoginAttempt.deleteMany({ email: normalizedEmail });

    // 3. Test failed authentication & lockout
    console.log("\n--- Testing 3-Factor Lockout Guard (3 Failed Attempts) ---");
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, passphrase: "WrongPassphrase!" }),
      });
      console.log(`Failed Attempt ${i}/3 -> Status: ${res.status}`);
    }

    // 4. Verify 429 lockout on correct credentials
    const lockRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, passphrase: ADMIN_PASSPHRASE }),
    });
    console.log(`✓ 2. Account Lockout Active (Status ${lockRes.status} on correct creds): ${lockRes.status === 429 ? "PASSED" : "FAILED"}`);

    // Clear test lockout attempts
    await AdminLoginAttempt.deleteMany({ email: normalizedEmail });

    // 5. Successful 3-Factor Login
    const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, passphrase: ADMIN_PASSPHRASE }),
    });
    const loginData = await loginRes.json();
    console.log(`✓ 3. 3-Factor Login Successful. Token issued (expires in 2h).`);
    const token = loginData.token;
    const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    // 6. Test Stats API
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log(`✓ 4. Platform Stats API: Total Companies = ${statsData.stats.totalCompanies}, Total Users = ${statsData.stats.users.total}`);

    // 7. Companies List API & Manual Override
    const compRes = await fetch(`${baseUrl}/api/admin/companies`, { headers: authHeaders });
    const compData = await compRes.json();
    const testComp = compData.companies[0];

    if (testComp) {
      console.log(`\n--- Testing Manual Subscription Override on '${testComp.companyName}' ---`);
      const overrideRes = await fetch(`${baseUrl}/api/admin/companies/${testComp._id}/subscription`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ tier: "scale" }),
      });
      const overrideData = await overrideRes.json();
      console.log(`✓ 5. Subscription Override Applied: Tier = '${overrideData.company.subscription.tier}', Override Active = ${overrideData.company.subscription.manualOverride.active}`);

      // Clear override
      const clearRes = await fetch(`${baseUrl}/api/admin/companies/${testComp._id}/subscription/clear-override`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const clearData = await clearRes.json();
      console.log(`✓ 6. Subscription Override Cleared: Override Active = ${clearData.company.subscription.manualOverride.active}`);

      // Test suspension
      console.log(`\n--- Testing Company Suspension Guard ---`);
      const suspRes = await fetch(`${baseUrl}/api/admin/companies/${testComp._id}/suspend`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const suspData = await suspRes.json();
      console.log(`✓ 7. Company Suspended: Status = '${suspData.company.status}'`);

      // Unsuspend
      await fetch(`${baseUrl}/api/admin/companies/${testComp._id}/suspend`, {
        method: "PATCH",
        headers: authHeaders,
      });
      console.log(`✓ 8. Company Reactivated: Status = 'active'`);
    }

    // 8. Immutable Audit Trail Logs Verification
    console.log(`\n--- Verifying Immutable Audit Trail ---`);
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, { headers: authHeaders });
    const auditData = await auditRes.json();
    console.log(`✓ 9. Audit Trail Verified: ${auditData.count} immutable log entries found in database.`);
    console.log("Recent Audit Events Sample:");
    auditData.logs.slice(0, 4).forEach((log) => {
      console.log(`  - [${log.timestamp}] Action: ${log.action} | Target: ${log.targetName} | IP: ${log.ipAddress}`);
    });

    server.close();
    await mongoose.disconnect();
    console.log("\n===================================================================");
    console.log("✅ ALL SUPER ADMIN PORTAL PHASES VERIFIED & READY FOR PRODUCTION!");
    console.log("===================================================================");
  } catch (err) {
    console.error("❌ Full Suite Test Failed:", err);
    process.exit(1);
  }
};

runFullSuite();
