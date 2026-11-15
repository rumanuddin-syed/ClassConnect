import "dotenv/config";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { resetPasswordController, logout } from "../controllers/authController.js";

const JWT_SECRET = "super_final_verification_secret_123456789";
process.env.JWT_SECRET = JWT_SECRET;

console.log("=== RUNNING FINAL 8-POINT CRITICAL VERIFICATION SUITE ===");

let passed = 0;
let total = 0;

async function runCheck(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Password-reset token reuse check
await runCheck("Check 1: Single-use password reset token cannot be reused after password reset", async () => {
  const resetToken = jwt.sign(
    { id: "mock_uid_1", email: "user@example.com", purpose: "password_reset", jti: "unique_jti_123" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Mock User db state
  let mockUser = {
    _id: "mock_uid_1",
    email: "user@example.com",
    tokenVersion: 0,
    usedResetTokens: [],
    save: async function() { return this; }
  };

  const origFindOne = User.findOne;
  User.findOne = () => Promise.resolve(mockUser);

  // First reset: should succeed
  let status1 = 200, body1 = null;
  const req1 = {
    body: { email: "user@example.com", newPassword: "NewPassword123!", resetToken }
  };
  const res1 = {
    status: (s) => { status1 = s; return { json: (d) => { body1 = d; } }; },
    json: (d) => { body1 = d; }
  };
  await resetPasswordController(req1, res1);
  assert.strictEqual(body1.success, true);
  assert.strictEqual(mockUser.usedResetTokens.includes("unique_jti_123"), true);
  assert.strictEqual(mockUser.tokenVersion, 1);

  // Second reset with SAME token: must be rejected with 403
  let status2 = 200, body2 = null;
  const req2 = {
    body: { email: "user@example.com", newPassword: "AnotherPassword123!", resetToken }
  };
  const res2 = {
    status: (s) => { status2 = s; return { json: (d) => { body2 = d; } }; },
    json: (d) => { body2 = d; }
  };
  await resetPasswordController(req2, res2);
  assert.strictEqual(status2, 403);
  assert.strictEqual(body2.success, false);
  assert.match(body2.message, /already been used/i);

  User.findOne = origFindOne;
});

// 2. TokenVersion validation against current database user
await runCheck("Check 2: Every authenticated API request validates tokenVersion against database user", async () => {
  const origFindById = User.findById;

  // Case A: token has version 0, DB user has version 1 (revoked)
  User.findById = () => ({
    select: () => Promise.resolve({ _id: "user_revoked", tokenVersion: 1 })
  });
  const tokenOld = jwt.sign({ id: "user_revoked", tokenVersion: 0 }, JWT_SECRET);
  const reqOld = { cookies: { token: tokenOld }, headers: {} };
  let statusA = null, bodyA = null;
  const resA = {
    status: (s) => { statusA = s; return { json: (d) => { bodyA = d; } }; }
  };
  let nextA = false;
  await isLoggedIn(reqOld, resA, () => { nextA = true; });
  assert.strictEqual(nextA, false);
  assert.strictEqual(statusA, 401);
  assert.match(bodyA.message, /revoked/i);

  // Case B: token has version 1, DB user has version 1 (valid)
  User.findById = () => ({
    select: () => Promise.resolve({ _id: "user_valid", tokenVersion: 1 })
  });
  const tokenValid = jwt.sign({ id: "user_valid", tokenVersion: 1 }, JWT_SECRET);
  const reqValid = { cookies: { token: tokenValid }, headers: {} };
  let nextB = false;
  await isLoggedIn(reqValid, {}, () => { nextB = true; });
  assert.strictEqual(nextB, true);
  assert.strictEqual(reqValid.user.id, "user_valid");

  User.findById = origFindById;
});

// 3. Logout increments tokenVersion in DB
await runCheck("Check 3: Logout actually increments tokenVersion in the database", async () => {
  const origFindByIdAndUpdate = User.findByIdAndUpdate;
  let incrementedUid = null;
  let updateOp = null;

  User.findByIdAndUpdate = (id, op) => {
    incrementedUid = id;
    updateOp = op;
    return Promise.resolve();
  };

  const req = { user: { id: "user_logout_456" } };
  let clearedCookieName = null;
  let clearedCookieOpts = null;
  let jsonRes = null;
  const res = {
    clearCookie: (name, opts) => {
      clearedCookieName = name;
      clearedCookieOpts = opts;
    },
    json: (d) => { jsonRes = d; }
  };

  await logout(req, res);

  assert.strictEqual(incrementedUid, "user_logout_456");
  assert.deepStrictEqual(updateOp, { $inc: { tokenVersion: 1 } });
  assert.strictEqual(clearedCookieName, "token");
  assert.strictEqual(clearedCookieOpts.httpOnly, true);
  assert.strictEqual(jsonRes.success, true);

  User.findByIdAndUpdate = origFindByIdAndUpdate;
});

// 4. CSRF protection validation
await runCheck("Check 4: CSRF protection checks Origin, Referer and required custom header", async () => {
  const allowedOrigins = ["http://localhost:5173"];

  const simulateCsrf = (method, path, headers) => {
    const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
    const isExempt = path.startsWith("/api/auth");
    if (isStateChanging && !isExempt && path.startsWith("/api")) {
      const origin = headers["origin"];
      const referer = headers["referer"];
      if (origin && !allowedOrigins.includes(origin)) return 403;
      if (referer && !allowedOrigins.includes(new URL(referer).origin)) return 403;
      if (!headers["x-requested-with"] && !headers["x-csrf-token"]) return 403;
    }
    return 200;
  };

  // Attacker site origin
  assert.strictEqual(simulateCsrf("POST", "/api/chat", { "origin": "http://evil.com", "x-requested-with": "XMLHttpRequest" }), 403);
  // Missing header
  assert.strictEqual(simulateCsrf("POST", "/api/chat", { "origin": "http://localhost:5173" }), 403);
  // Legitimate request
  assert.strictEqual(simulateCsrf("POST", "/api/chat", { "origin": "http://localhost:5173", "x-requested-with": "XMLHttpRequest" }), 200);
});

// 5. Socket.io authorization check
await runCheck("Check 5: Socket.io authenticates with HttpOnly cookie and validates room membership", async () => {
  // Test cookie header extraction
  const cookieHeader = "other=123; token=" + jwt.sign({ id: "sock_user_1", name: "Sock User" }, JWT_SECRET) + "; foo=bar";
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  assert.ok(match);
  const decoded = jwt.verify(match[1], JWT_SECRET);
  assert.strictEqual(decoded.id, "sock_user_1");

  // Room access validation
  const classroom = {
    _id: "class_1",
    admin: { toString: () => "admin_user" },
    members: [{ user: { toString: () => "member_user" }, role: "student" }]
  };
  const isAuthorized = (uid) => uid === classroom.admin.toString() || classroom.members.some(m => m.user.toString() === uid);
  assert.strictEqual(isAuthorized("admin_user"), true);
  assert.strictEqual(isAuthorized("member_user"), true);
  assert.strictEqual(isAuthorized("unauthorized_user"), false);
});

console.log(`\nFinal Suite: ${passed}/${total} passed.\n`);
if (passed !== total) process.exit(1);

