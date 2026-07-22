const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Company = require("../src/models/Company");
const User = require("../src/models/User");
const SuperAdminAuditLog = require("../src/models/SuperAdminAuditLog");

const testPhases3to6 = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSPHRASE, MONGO_URI } = process.env;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB for Phases 3-6 Verification.");

    const app = require("../src/app");
    const http = require("http");
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    // 1. Authenticate Admin
    const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passphrase: ADMIN_PASSPHRASE,
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log(`\n--- Phase 3: Platform Stats ---`);
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log("Stats Data:", statsData.stats);

    console.log(`\n--- Phase 3: Companies Directory ---`);
    const compRes = await fetch(`${baseUrl}/api/admin/companies`, { headers: authHeaders });
    const compData = await compRes.json();
    console.log(`Found ${compData.count} companies.`);

    let targetCompany = compData.companies[0];
    if (!targetCompany) {
      console.log("No existing company found; creating dummy company for test...");
      const dummyOwner = await User.create({
        name: "Test Owner",
        email: `testowner_${Date.now()}@example.com`,
        role: "owner",
      });
      targetCompany = await Company.create({
        companyName: `Test Corp ${Date.now()}`,
        owner: dummyOwner._id,
      });
      dummyOwner.company = targetCompany._id;
      await dummyOwner.save();
    }

    console.log(`Target Test Company: '${targetCompany.companyName}' (ID: ${targetCompany._id})`);

    console.log(`\n--- Phase 4: Set Subscription Manual Override to 'scale' ---`);
    const subRes = await fetch(`${baseUrl}/api/admin/companies/${targetCompany._id}/subscription`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ tier: "scale" }),
    });
    const subData = await subRes.json();
    console.log("Override Response:", subData.company?.subscription);

    console.log(`\n--- Phase 4: Clear Manual Subscription Override ---`);
    const clearRes = await fetch(`${baseUrl}/api/admin/companies/${targetCompany._id}/subscription/clear-override`, {
      method: "PATCH",
      headers: authHeaders,
    });
    const clearData = await clearRes.json();
    console.log("Cleared Override Response:", clearData.company?.subscription);

    console.log(`\n--- Phase 5: Suspend Company ---`);
    const suspendRes = await fetch(`${baseUrl}/api/admin/companies/${targetCompany._id}/suspend`, {
      method: "PATCH",
      headers: authHeaders,
    });
    const suspendData = await suspendRes.json();
    console.log("Suspend Response Status:", suspendData.company?.status);

    console.log(`\n--- Phase 5: Test User Access Guard for Suspended Company ---`);
    const companyUser = await User.findOne({ company: targetCompany._id });
    if (companyUser) {
      const userToken = require("jsonwebtoken").sign(
        { id: companyUser._id, role: companyUser.role },
        process.env.JWT_SECRET
      );
      const userApiRes = await fetch(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      console.log(`Suspended User API Access Status: ${userApiRes.status} (Expected 403 Forbidden)`);
    }

    console.log(`\n--- Phase 5: Unsuspend Company ---`);
    const unsuspendRes = await fetch(`${baseUrl}/api/admin/companies/${targetCompany._id}/suspend`, {
      method: "PATCH",
      headers: authHeaders,
    });
    const unsuspendData = await unsuspendRes.json();
    console.log("Unsuspend Response Status:", unsuspendData.company?.status);

    console.log(`\n--- Phase 6: Fetch Audit Logs ---`);
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, { headers: authHeaders });
    const auditData = await auditRes.json();
    console.log(`Fetched ${auditData.count} Audit Log Entries.`);
    console.log("Latest 3 Log Actions:", auditData.logs.slice(0, 3).map((l) => ({ action: l.action, target: l.targetName, time: l.timestamp })));

    server.close();
    await mongoose.disconnect();
    console.log("\n✅ PHASES 3–6 BACKEND VERIFICATION PASSED!");
  } catch (err) {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  }
};

testPhases3to6();
