const assert = require("assert");
const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("../src/app");
const errorHandler = require("../src/middleware/error.middleware");

async function runSecurityTests() {
  console.log("==================================================");
  console.log("  VENDOROS SECURITY PATCH VERIFICATION SUITE      ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED: ${name}`);
      console.error(`   Error:`, err.message);
      failed++;
    }
  };

  const makeRequest = (options, bodyData) => {
    return new Promise((resolve) => {
      const { EventEmitter } = require("events");
      
      const req = new EventEmitter();
      req.method = options.method || "GET";
      req.url = options.path || "/";
      req.headers = {};
      if (options.headers) {
        for (const [k, v] of Object.entries(options.headers)) {
          req.headers[k.toLowerCase()] = v;
        }
      }
      req.ip = "127.0.0.1";
      req.connection = { remoteAddress: "127.0.0.1" };
      req.body = bodyData || {};

      let statusCode = 200;
      const resHeaders = {};
      let responseBody = null;

      const res = {
        statusCode: 200,
        status(code) {
          statusCode = code;
          this.statusCode = code;
          return this;
        },
        setHeader(name, val) {
          resHeaders[name.toLowerCase()] = val;
          return this;
        },
        getHeader(name) {
          return resHeaders[name.toLowerCase()];
        },
        json(data) {
          responseBody = data;
          resolve({ status: statusCode, headers: resHeaders, body: responseBody });
        },
        send(data) {
          responseBody = data;
          resolve({ status: statusCode, headers: resHeaders, body: responseBody });
        },
        end(data) {
          if (data && !responseBody) responseBody = data;
          resolve({ status: statusCode, headers: resHeaders, body: responseBody });
        },
      };

      app.handle(req, res, (err) => {
        if (err) {
          errorHandler(err, req, res, () => {});
        } else {
          resolve({ status: 404, headers: resHeaders, body: { message: "Not Found" } });
        }
      });
    });
  };

  try {
    // 1. CORS Test: Unauthorized origin rejection
    await test("SEC-08: CORS rejects untrusted origins (e.g. evil-attacker.vercel.app)", async () => {
      const res = await makeRequest({
        path: "/",
        method: "GET",
        headers: { Origin: "https://evil-attacker.vercel.app" },
      });
      const allowOrigin = res.headers["access-control-allow-origin"];
      assert.strictEqual(
        allowOrigin === null || allowOrigin === undefined || allowOrigin === "",
        true,
        `Untrusted origin received access-control-allow-origin: ${allowOrigin}`
      );
    });

    // 2. CORS Test: Trusted origin allowed
    await test("SEC-08: CORS allows approved VendorOS origin", async () => {
      const res = await makeRequest({
        path: "/",
        method: "GET",
        headers: { Origin: "https://vendoros.vercel.app" },
      });
      const allowOrigin = res.headers["access-control-allow-origin"];
      assert.strictEqual(allowOrigin, "https://vendoros.vercel.app");
    });

    // 3. Security Headers Test
    await test("SEC-08: Standard Security Headers present in responses", async () => {
      const res = await makeRequest({ path: "/", method: "GET" });
      assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
      assert.strictEqual(res.headers["x-frame-options"], "SAMEORIGIN");
      assert.strictEqual(res.headers["x-xss-protection"], "1; mode=block");
    });

    // 4. Copilot Risk Paywall Test: Unauthenticated call is rejected
    await test("SEC-06: /api/copilot/risk rejects unauthenticated callers with 401", async () => {
      const res = await makeRequest(
        {
          path: "/api/copilot/risk",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        {
          order: { title: "Test Order", value: 5000 },
          subscription: { tier: "scale", status: "active" }, // Fake client-provided tier
        }
      );
      assert.strictEqual(res.status, 401, `Expected 401 Unauthorized, got ${res.status}`);
    });

    // 5. Razorpay Webhook Test: Rejects missing/invalid HMAC when secret configured
    await test("SEC-07: /api/razorpay/webhook checks HMAC signature when secret set", async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_key_12345";
      const res = await makeRequest(
        {
          path: "/api/razorpay/webhook",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        {
          event: "subscription.charged",
          subscriptionId: "sub_123",
          tier: "growth",
        }
      );
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request on missing signature, got ${res.status}`);
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
    });

    // 6. Global Error Handler Test: Handles CastError cleanly
    await test("SEC-09: Error Middleware formats CastError cleanly", async () => {
      const mockReq = { method: "GET", originalUrl: "/api/test" };
      let responseStatus = 0;
      let responseJson = null;
      const mockRes = {
        status: (s) => {
          responseStatus = s;
          return {
            json: (j) => {
              responseJson = j;
            },
          };
        },
      };
      const castErr = new Error("Cast to ObjectId failed");
      castErr.name = "CastError";

      errorHandler(castErr, mockReq, mockRes, () => {});
      assert.strictEqual(responseStatus, 400);
      assert.strictEqual(responseJson.success, false);
      assert.strictEqual(responseJson.message, "Invalid resource identifier format");
    });

    // 7. JWT Secret Fallback Test: generateToken fails safely if JWT_SECRET missing
    await test("SEC-10: generateToken fails fast if JWT_SECRET is unset", async () => {
      const generateToken = require("../src/utils/generateToken");
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      let caught = false;
      try {
        generateToken("user123", "owner");
      } catch (err) {
        caught = true;
        assert(err.message.includes("JWT_SECRET"));
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
      assert.strictEqual(caught, true, "generateToken should throw when JWT_SECRET is missing");
    });

    // 8. Controller Unit Test: SEC-02 updateProfile ignores role and companyId
    await test("SEC-02: updateProfile controller ignores role and companyId escalation", async () => {
      const { updateProfile } = require("../src/controllers/user.controller");
      const User = require("../src/models/User");
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;

      let capturedUpdate = null;
      User.findByIdAndUpdate = (id, update) => {
        capturedUpdate = update;
        return {
          populate: () => Promise.resolve({ _id: id, name: "New Name", role: "worker", company: "comp_1" }),
        };
      };

      const mockReq = {
        user: { _id: "usr_123", name: "Old Name", role: "worker", company: "comp_1" },
        body: { name: "New Name", role: "manager", companyId: "comp_malicious" },
      };
      let jsonResponse = null;
      const mockRes = {
        status: () => ({
          json: (d) => {
            jsonResponse = d;
          },
        }),
      };

      await updateProfile(mockReq, mockRes);
      User.findByIdAndUpdate = originalFindByIdAndUpdate;

      assert.strictEqual(jsonResponse.success, true);
      assert.strictEqual(capturedUpdate.$set.role, undefined, "role must not be in updateFields");
      assert.strictEqual(capturedUpdate.$set.company, undefined, "company must not be in updateFields");
      assert.strictEqual(capturedUpdate.$set.name, "New Name");
    });

    // 9. Controller Unit Test: SEC-05 updateOrder ignores immutable fields mass assignment
    await test("SEC-05: updateOrder controller ignores company & totalAmount mass assignment", async () => {
      const { updateOrder } = require("../src/controllers/order.controller");
      const Order = require("../src/models/Order");
      const originalFindOne = Order.findOne;

      const mockOrderDoc = {
        _id: "ord_123",
        company: "comp_1",
        totalAmount: 500,
        customerName: "Alice",
        save: async function () {
          return this;
        },
      };

      Order.findOne = () => Promise.resolve(mockOrderDoc);

      const mockReq = {
        params: { id: "ord_123" },
        user: { company: "comp_1" },
        body: {
          customerName: "Alice Updated",
          company: "comp_malicious",
          totalAmount: 0,
          status: "Accepted",
        },
      };
      let jsonResponse = null;
      const mockRes = {
        status: () => ({
          json: (d) => {
            jsonResponse = d;
          },
        }),
      };

      await updateOrder(mockReq, mockRes);
      Order.findOne = originalFindOne;

      assert.strictEqual(jsonResponse.success, true);
      assert.strictEqual(mockOrderDoc.company, "comp_1", "company must remain unchanged");
      assert.strictEqual(mockOrderDoc.totalAmount, 500, "totalAmount must remain unchanged");
      assert.strictEqual(mockOrderDoc.customerName, "Alice Updated", "customerName should be updated");
      assert.strictEqual(mockOrderDoc.status, "Accepted", "status should be updated");
    });

    // 10. Controller Unit Test: SEC-03 voiceUpdate rejects order not belonging to company
    await test("SEC-03: voiceUpdate enforces tenant isolation and worker assignment check", async () => {
      const { submitVoiceUpdate } = require("../src/controllers/voiceUpdate.controller");
      const Order = require("../src/models/Order");
      const originalFindOne = Order.findOne;

      let queriedWith = null;
      Order.findOne = (query) => {
        queriedWith = query;
        return Promise.resolve(null); // simulate order not found for this tenant
      };

      const mockReq = {
        params: { orderId: "ord_foreign_999" },
        user: { _id: "usr_worker_1", role: "worker", company: "comp_tenant_A" },
        file: { buffer: Buffer.from("audio"), originalname: "voice.webm" },
      };
      let statusCode = 0;
      let jsonResponse = null;
      const mockRes = {
        status: (s) => {
          statusCode = s;
          return {
            json: (d) => {
              jsonResponse = d;
            },
          };
        },
      };

      await submitVoiceUpdate(mockReq, mockRes);
      Order.findOne = originalFindOne;

      assert.strictEqual(queriedWith.company, "comp_tenant_A", "Must query with user's company");
      assert.strictEqual(queriedWith.assignedWorker, "usr_worker_1", "Worker query must check assignedWorker");
      assert.strictEqual(statusCode, 404);
      assert(jsonResponse.error.includes("Order not found or access denied"));
    });

    console.log("\n==================================================");
    console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Fatal Test Suite Error:", err);
    process.exit(1);
  }
}

runSecurityTests();
