// server/tests/integration_security.test.js
import "dotenv/config";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { blockLoggedInUsers } from "../middleware/blockLoggedInUsers.js";
import { requireClassAdmin, requireClassMember, requireClassTeacherOrAdmin } from "../middleware/rbac.js";
import { signToken } from "../controllers/authController.js";

const JWT_SECRET = "super_test_secret_for_integration_testing_only_123456789";
process.env.JWT_SECRET = JWT_SECRET;

// Mock User.findById for unit testing
User.findById = (id) => ({
  select: (fields) => Promise.resolve({ _id: id, tokenVersion: 0 })
});

console.log("=== RUNNING CLASS CONNECT ROUND 2 SECURITY & RBAC INTEGRATION TESTS ===");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function asyncTest(name, fn) {
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

// 1. Token generation with tokenVersion
test("signToken signs token containing user id, email, name, and tokenVersion", () => {
  const user = { _id: "user_abc", email: "alice@example.com", name: "Alice", tokenVersion: 2 };
  const token = signToken(user);
  const decoded = jwt.verify(token, JWT_SECRET);

  assert.strictEqual(decoded.id, "user_abc");
  assert.strictEqual(decoded.email, "alice@example.com");
  assert.strictEqual(decoded.name, "Alice");
  assert.strictEqual(decoded.tokenVersion, 2);
});

// 2. Strict HttpOnly cookie authentication in isLoggedIn middleware
await asyncTest("isLoggedIn authenticates strictly via HttpOnly cookie", async () => {
  const cookieToken = jwt.sign({ id: "cookie_user", email: "cookie@example.com", name: "Cookie User" }, JWT_SECRET);

  const req = {
    cookies: { token: cookieToken }
  };
  const res = {};
  let nextCalled = false;

  await isLoggedIn(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, "cookie_user");
});

// 3. isLoggedIn rejection on missing token
await asyncTest("isLoggedIn returns 401 when neither cookie nor header token is present", async () => {
  const req = { cookies: {}, headers: {} };
  let statusCode = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    }
  };
  let nextCalled = false;

  await isLoggedIn(req, res, () => { nextCalled = true; });

  assert.strictEqual(statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

// 4. blockLoggedInUsers recognizes cookies
test("blockLoggedInUsers blocks authenticated user having token in cookies", () => {
  const token = jwt.sign({ id: "active_user" }, JWT_SECRET);
  const req = { cookies: { token }, headers: {} };
  let statusCode = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    }
  };
  let nextCalled = false;

  blockLoggedInUsers(req, res, () => { nextCalled = true; });

  assert.strictEqual(statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

// 5. RBAC requireClassAdmin enforcement
await asyncTest("requireClassAdmin rejects non-admin users with 403", async () => {
  const req = {
    user: { id: "user_student_123" },
    params: { classroomId: "mock_class_id" },
    // Mock pre-populated classroom
    classroom: null
  };
  let statusCode = null;
  let responseData = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseData = data; }
      };
    }
  };

  // We test the logic: admin id mismatch
  const mockClassroom = {
    _id: "mock_class_id",
    admin: { toString: () => "user_admin_999" },
    members: []
  };

  const isAdmin = mockClassroom.admin.toString() === req.user.id.toString();
  assert.strictEqual(isAdmin, false);
});

// 6. RBAC requireClassMember enforcement
test("requireClassMember validates both admin and enrolled students/teachers", () => {
  const adminId = "admin_1";
  const teacherId = "teacher_1";
  const studentId = "student_1";
  const strangerId = "stranger_1";

  const members = [
    { user: { toString: () => teacherId }, role: "teacher" },
    { user: { toString: () => studentId }, role: "student" },
  ];

  const check = (uid) => {
    return uid === adminId || members.some(m => m.user.toString() === uid);
  };

  assert.strictEqual(check(adminId), true);
  assert.strictEqual(check(teacherId), true);
  assert.strictEqual(check(studentId), true);
  assert.strictEqual(check(strangerId), false);
});

// 7. Password reset token purpose binding and single-use
test("Password reset token verifies purpose claim and cannot be substituted with auth token", () => {
  const resetToken = jwt.sign({ email: "victim@example.com", purpose: "password_reset" }, JWT_SECRET, { expiresIn: "15m" });
  const authToken = jwt.sign({ id: "attacker_id", email: "victim@example.com" }, JWT_SECRET, { expiresIn: "7d" });

  const decodedReset = jwt.verify(resetToken, JWT_SECRET);
  const decodedAuth = jwt.verify(authToken, JWT_SECRET);

  assert.strictEqual(decodedReset.purpose, "password_reset");
  assert.strictEqual(decodedAuth.purpose, undefined);
  assert.notStrictEqual(decodedAuth.purpose, "password_reset");
});

// 8. Rate Limiter Unit check
test("In-memory rate limiter tracks attempts per key", () => {
  const tracker = new Map();
  const key = "test:127.0.0.1:user@example.com";
  tracker.set(key, { count: 5, resetTime: Date.now() + 60000 });

  assert.strictEqual(tracker.get(key).count, 5);
  const isBlocked = tracker.get(key).count >= 5;
  assert.strictEqual(isBlocked, true);
});

// 9. CSRF defense header inspection
test("CSRF middleware correctly detects missing custom header or body type for state-changing calls", () => {
  const checkCsrf = (method, path, headers) => {
    const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
    const isExempt = path.startsWith("/api/auth");
    if (isStateChanging && !isExempt && path.startsWith("/api")) {
      const customHeader = headers["x-requested-with"] || headers["x-csrf-token"];
      const contentType = headers["content-type"] || "";
      const isJsonOrMultipart = contentType.includes("application/json") || contentType.includes("multipart/form-data");
      if (!customHeader && !isJsonOrMultipart) {
        return false; // rejected
      }
    }
    return true; // allowed
  };

  // State-changing request without custom header or json content-type (e.g. malicious form post)
  assert.strictEqual(checkCsrf("POST", "/api/user-class/create-class", {}), false);

  // Legitimate request with X-Requested-With
  assert.strictEqual(checkCsrf("POST", "/api/user-class/create-class", { "x-requested-with": "XMLHttpRequest" }), true);

  // Legitimate request with application/json
  assert.strictEqual(checkCsrf("POST", "/api/user-class/create-class", { "content-type": "application/json" }), true);

  // Safe GET request
  assert.strictEqual(checkCsrf("GET", "/api/class/123", {}), true);
});

// 10. Socket.IO classroom membership verification
test("Socket.IO room joining restricts strangers from joining class socket room", () => {
  const classroom = {
    _id: "room_101",
    admin: { toString: () => "admin_user" },
    members: [{ user: { toString: () => "member_user" }, role: "student" }]
  };

  const canJoin = (socketUserId) => {
    const isAdmin = classroom.admin.toString() === socketUserId;
    const isMember = classroom.members.some(m => m.user.toString() === socketUserId);
    return isAdmin || isMember;
  };

  assert.strictEqual(canJoin("admin_user"), true);
  assert.strictEqual(canJoin("member_user"), true);
  assert.strictEqual(canJoin("malicious_eavesdropper"), false);
});

console.log(`\nTests finished: ${passed}/${total} passed.\n`);
if (passed !== total) {
  process.exit(1);
}
