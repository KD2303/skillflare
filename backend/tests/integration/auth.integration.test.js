import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/server.js";
import { User } from "../../src/models/index.js";
import { connectDB, disconnectDB } from "../../src/config/db.js";

describe("Authentication API Integration Tests", () => {
  let server;
  let testUser;
  let authToken;

  before(async () => {
    await connectDB();
    server = app.listen(5001);
  });

  after(async () => {
    await disconnectDB();
    server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    testUser = {
      email: "student@mitsgwl.ac.in",
      password: "TestPassword123",
      username: "teststudent",
      role: "student",
    };
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new student user successfully", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("registered successfully");
      expect(res.body.data).toHaveProperty("userId");

      // Verify user created in database
      const createdUser = await User.findOne({ email: testUser.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser.username).toBe(testUser.username);
    });

    it("should auto-assign student role for @mitsgwl.ac.in email", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.body.data.role).toBe("student");
    });

    it("should auto-assign teacher role for @mitsgwalior.in email", async () => {
      const teacherUser = { ...testUser, email: "teacher@mitsgwalior.in" };
      const res = await request(server)
        .post("/api/auth/register")
        .send(teacherUser);

      expect(res.body.data.role).toBe("teacher");
    });

    it("should reject duplicate email", async () => {
      await request(server).post("/api/auth/register").send(testUser);

      const res = await request(server)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });

    it("should reject weak password", async () => {
      const weakPassword = { ...testUser, password: "weak" };
      const res = await request(server)
        .post("/api/auth/register")
        .send(weakPassword);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("password");
    });

    it("should reject invalid email format", async () => {
      const invalidEmail = { ...testUser, email: "notanemail" };
      const res = await request(server)
        .post("/api/auth/register")
        .send(invalidEmail);

      expect(res.status).toBe(400);
    });

    it("should hash password before storing", async () => {
      await request(server).post("/api/auth/register").send(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2a\$|^\$2b\$|^\$2y\$/); // bcrypt format
    });

    it("should rate limit after 10 failed attempts", async () => {
      const attempts = [];
      for (let i = 0; i < 12; i++) {
        const res = await request(server)
          .post("/api/auth/register")
          .send({ ...testUser, email: `email${i}@mitsgwl.ac.in` });
        attempts.push(res.status);
      }

      // Later attempts should be rate limited
      expect(attempts[11]).toBe(429); // Too Many Requests
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(server).post("/api/auth/register").send(testUser);
    });

    it("should login with correct credentials", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("userId");

      authToken = res.body.data.token;
    });

    it("should set secure httpOnly cookie", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toContain("HttpOnly");
      expect(setCookie[0]).toContain("SameSite=Strict");
    });

    it("should reject incorrect password", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent email", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "nonexistent@mitsgwl.ac.in",
        password: testUser.password,
      });

      expect(res.status).toBe(401);
    });

    it("should not expose user enumeration", async () => {
      const res1 = await request(server).post("/api/auth/login").send({
        email: "nonexistent@mitsgwl.ac.in",
        password: "anypassword",
      });

      const res2 = await request(server).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      // Both should return same error message
      expect(res1.body.message).toBe(res2.body.message);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    beforeEach(async () => {
      await request(server).post("/api/auth/register").send(testUser);
    });

    it("should return success for existing user", async () => {
      const res = await request(server)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If account exists");
    });

    it("should return success for non-existent email (enumeration prevention)", async () => {
      const res = await request(server)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@mitsgwl.ac.in" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Same message as existing user
    });

    it("should generate reset token valid for 15 minutes", async () => {
      await request(server)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      const user = await User.findOne({ email: testUser.email }).select(
        "+resetToken +resetTokenExpiry",
      );
      expect(user.resetToken).toBeTruthy();
      expect(user.resetTokenExpiry).toBeTruthy();

      const now = new Date();
      const expiryDiff = user.resetTokenExpiry - now;
      // Token should expire in ~15 minutes
      expect(expiryDiff).toBeLessThan(16 * 60 * 1000);
      expect(expiryDiff).toBeGreaterThan(14 * 60 * 1000);
    });

    it("should not expose reset token in response", async () => {
      const res = await request(server)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      expect(res.body.data).toBeUndefined();
      expect(res.body.resetToken).toBeUndefined();
    });

    it("should rate limit password reset requests", async () => {
      const requests = [];
      for (let i = 0; i < 12; i++) {
        const res = await request(server)
          .post("/api/auth/forgot-password")
          .send({ email: `user${i}@mitsgwl.ac.in` });
        requests.push(res.status);
      }

      expect(requests[11]).toBe(429); // Rate limited
    });
  });

  describe("POST /api/auth/reset-password/:token", () => {
    let resetToken;
    let resetTokenJwt;

    beforeEach(async () => {
      // Create user
      await request(server).post("/api/auth/register").send(testUser);

      // Trigger forgot password to get token
      await request(server)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      // Get token from database
      const user = await User.findOne({ email: testUser.email }).select(
        "+resetToken",
      );
      resetToken = user.resetToken;
      resetTokenJwt = resetToken; // In real test, would be from email link
    });

    it("should reset password with valid token", async () => {
      const newPassword = "NewPassword123";
      const res = await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: newPassword,
          confirmPassword: newPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify can login with new password
      const loginRes = await request(server).post("/api/auth/login").send({
        email: testUser.email,
        password: newPassword,
      });

      expect(loginRes.status).toBe(200);
    });

    it("should reject expired token", async () => {
      // Set expiry to past
      await User.updateOne(
        { email: testUser.email },
        { resetTokenExpiry: new Date(Date.now() - 1000) },
      );

      const res = await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("expired");
    });

    it("should reject invalid token", async () => {
      const res = await request(server)
        .post("/api/auth/reset-password/invalid.token.here")
        .send({
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        });

      expect(res.status).toBe(400);
    });

    it("should clear reset token after successful reset", async () => {
      const newPassword = "NewPassword123";
      await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: newPassword,
          confirmPassword: newPassword,
        });

      const user = await User.findOne({ email: testUser.email }).select(
        "+resetToken",
      );
      expect(user.resetToken).toBeNull();
    });

    it("should reject token reuse (one-time use)", async () => {
      const newPassword = "NewPassword123";

      // First reset succeeds
      await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: newPassword,
          confirmPassword: newPassword,
        });

      // Second attempt with same token should fail
      const res = await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: "AnotherPassword123",
          confirmPassword: "AnotherPassword123",
        });

      expect(res.status).toBe(400);
    });

    it("should validate password strength", async () => {
      const weakPassword = "weak";
      const res = await request(server)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: weakPassword,
          confirmPassword: weakPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("password");
    });
  });

  describe("GET /api/auth/me - Protected Route", () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(server)
        .post("/api/auth/register")
        .send(testUser);

      token = registerRes.body.data.token;
    });

    it("should return user data with valid token", async () => {
      const res = await request(server)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it("should reject request without token", async () => {
      const res = await request(server).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("unauthorized");
    });

    it("should reject request with invalid token", async () => {
      const res = await request(server)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
    });

    it("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { userId: "someid" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" }, // Expired
      );

      const res = await request(server)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    let token;

    beforeEach(async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send(testUser);
      token = res.body.data.token;
    });

    it("should logout user successfully", async () => {
      const res = await request(server)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should clear auth cookie on logout", async () => {
      const res = await request(server)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      // Cookie should be deleted (expires in past or maxAge=0)
    });

    it("should invalidate token after logout", async () => {
      await request(server)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      // Subsequent request with same token should fail
      const res = await request(server)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
    });
  });

  describe("Security Tests - Injection Attacks", () => {
    it("should prevent NoSQL injection in login", async () => {
      const payload = {
        email: { $ne: null },
        password: { $ne: null },
      };

      const res = await request(server).post("/api/auth/login").send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should sanitize email input", async () => {
      const injectionAttempt = {
        email: 'test@example.com<script>alert("xss")</script>',
        password: "password123",
      };

      const res = await request(server)
        .post("/api/auth/register")
        .send(injectionAttempt);

      // Either reject or sanitize
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should prevent command injection", async () => {
      const injectionAttempt = {
        email: "test@example.com; rm -rf /",
        password: "password123",
      };

      const res = await request(server)
        .post("/api/auth/register")
        .send(injectionAttempt);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});

export default {};
