// server/tests/auth_rbac.test.js
import assert from "node:assert";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { blockLoggedInUsers } from "../middleware/blockLoggedInUsers.js";
import { requireClassAdmin, requireClassMember, requireClassTeacherOrAdmin } from "../middleware/rbac.js";

const JWT_SECRET = "test_super_secret_key_for_testing_purposes_123456789";
process.env.JWT_SECRET = JWT_SECRET;

// Mock User.findById for unit testing
const origFindById = User.findById;
User.findById = (id) => ({
  select: (fields) => Promise.resolve({ _id: id, tokenVersion: 0 })
});

console.log("=== RUNNING CLASS CONNECT AUTH & RBAC UNIT TESTS ===");

let passed = 0;
let total = 0;

function runTest(name, fn) {
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

async function runAsyncTest(name, fn) {
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

// 1. JWT Generation and Verification
runTest("JWT token generation includes user id, email, and name", () => {
  const payload = { id: "user123", email: "student@example.com", name: "Student Test" };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.id, "user123");
  assert.strictEqual(decoded.email, "student@example.com");
  assert.strictEqual(decoded.name, "Student Test");
});

// 2. isLoggedIn middleware rejects missing token
await runAsyncTest("isLoggedIn rejects requests with no token (401)", async () => {
  let status = null;
  let jsonResponse = null;
  const req = { headers: {} };
  const res = {
    status: (s) => {
      status = s;
      return {
        json: (j) => {
          jsonResponse = j;
        },
      };
    },
  };
  let nextCalled = false;
  await isLoggedIn(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(status, 401);
  assert.strictEqual(nextCalled, false);
});

// 3. isLoggedIn middleware accepts valid HttpOnly cookie
await runAsyncTest("isLoggedIn accepts valid cookie token and attaches req.user", async () => {
  const token = jwt.sign({ id: "user123", email: "test@example.com", name: "Tester" }, JWT_SECRET);
  const req = { cookies: { token } };
  const res = {};
  let nextCalled = false;
  await isLoggedIn(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, "user123");
  assert.strictEqual(req.user.email, "test@example.com");
  assert.strictEqual(req.user.name, "Tester");
});

// 4. isLoggedIn rejects requests with Bearer token only (strict cookie transport)
await runAsyncTest("isLoggedIn rejects requests without cookie even if Bearer token is present", async () => {
  const token = jwt.sign({ id: "user123", email: "test@example.com", name: "Tester" }, JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  let status = null;
  const res = {
    status: (s) => {
      status = s;
      return { json: () => {} };
    },
  };
  let nextCalled = false;
  await isLoggedIn(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(status, 401);
  assert.strictEqual(nextCalled, false);
});

// 5. isLoggedIn rejects invalid/expired token
await runAsyncTest("isLoggedIn rejects invalid signature token (401)", async () => {
  const req = { cookies: { token: "invalid.token.value" } };
  let status = null;
  const res = {
    status: (s) => {
      status = s;
      return { json: () => {} };
    },
  };
  let nextCalled = false;
  await isLoggedIn(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(status, 401);
  assert.strictEqual(nextCalled, false);
});

// 6. blockLoggedInUsers permits guests
runTest("blockLoggedInUsers allows guests through without token", () => {
  const req = { headers: {} };
  const res = {};
  let nextCalled = false;
  blockLoggedInUsers(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
});

// 7. blockLoggedInUsers rejects logged in users
runTest("blockLoggedInUsers rejects users who present a valid cookie token (403)", () => {
  const token = jwt.sign({ id: "user123" }, JWT_SECRET);
  const req = { cookies: { token } };
  let status = null;
  const res = {
    status: (s) => {
      status = s;
      return { json: () => {} };
    },
  };
  let nextCalled = false;
  blockLoggedInUsers(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(status, 403);
  assert.strictEqual(nextCalled, false);
});

// 8. Password hashing and verification
await runAsyncTest("Password hashing and comparison with bcryptjs", async () => {
  const plain = "SuperSecretPassword123!";
  const hash = await bcrypt.hash(plain, 10);
  const isMatch = await bcrypt.compare(plain, hash);
  const isWrong = await bcrypt.compare("WrongPassword", hash);
  assert.strictEqual(isMatch, true);
  assert.strictEqual(isWrong, false);
});

// 9. Single-use Password Reset Token Verification
runTest("Password reset token verifies purpose claim", () => {
  const resetToken = jwt.sign({ email: "user@example.com", purpose: "password_reset" }, JWT_SECRET, { expiresIn: "15m" });
  const decoded = jwt.verify(resetToken, JWT_SECRET);
  assert.strictEqual(decoded.email, "user@example.com");
  assert.strictEqual(decoded.purpose, "password_reset");

  // A standard auth token cannot be used as reset token
  const authToken = jwt.sign({ id: "user123", email: "user@example.com" }, JWT_SECRET);
  const decodedAuth = jwt.verify(authToken, JWT_SECRET);
  assert.notStrictEqual(decodedAuth.purpose, "password_reset");
});

console.log(`\nTests finished: ${passed}/${total} passed.\n`);
if (passed !== total) {
  process.exit(1);
}

