const request = require("supertest");
const bcrypt = require("bcrypt");
const { AdminAuth } = require("../../../../model/admin/auth");

describe("/api/admin/auth", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await AdminAuth.remove({});
  });
  describe("/login", () => {
    it("Should return 400 if body validate not correct", async () => {
      const res = await request(server)
        .post("/api/admin/auth/login")
        .send({
          schoolSecretKey: "12345",
          username: "ib",
          password: "123"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 404 if login user not found", async () => {
      const res = await request(server)
        .post("/api/admin/auth/login")
        .send({
          schoolSecretKey: "12345678",
          username: "ibrahim",
          password: "12345678"
        });
      expect(res.status).toBe(404);
    });

    it("Should return 404 if secret Key is invalid", async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);
      const hashedSecretKey = await bcrypt.hash("12345678", salt);

      await new AdminAuth({
        schoolSecretKey: hashedSecretKey,
        username: "admin",
        password: hashedPassword,
        isAdmin: true
      }).save();

      const res = await request(server)
        .post("/api/admin/auth/login")
        .send({
          schoolSecretKey: "1234",
          username: "admin",
          password: "12345678"
        });
      expect(res.status).toBe(404);
    });

    it("Should return 404 if password is invalid", async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);
      const hashedSecretKey = await bcrypt.hash("12345678", salt);

      await new AdminAuth({
        schoolSecretKey: hashedSecretKey,
        username: "admin",
        password: hashedPassword,
        isAdmin: true
      }).save();

      const res = await request(server)
        .post("/api/admin/auth/login")
        .send({
          schoolSecretKey: "12345678",
          username: "admin",
          password: "1234567890"
        });
      expect(res.status).toBe(404);
    });
  });
  describe("/register", () => {
    it("Should return 400 if body is not valid", async () => {
      const res = await request(server)
        .post("/api/admin/auth/register")
        .send({
          schoolSecretKey: "12345",
          username: "ib",
          password: "123"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if admin username is already in use", async () => {
      await new AdminAuth({
        schoolSecretKey: "12345678",
        username: "mosh",
        password: "12345678"
      }).save();

      const res = await request(server)
        .post("/api/admin/auth/register")
        .send({
          schoolSecretKey: "12345678",
          username: "mosh",
          password: "123456789"
        });
      expect(res.status).toBe(400);
    });

    it("Should hash pass and secret key to save to db", async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);
      const hashedSecretKey = await bcrypt.hash("12345678", salt);

      const res = await request(server)
        .post("/api/admin/auth/register")
        .send({
          schoolSecretKey: hashedSecretKey,
          username: "mosh",
          password: hashedPassword
        });
      const admin = await AdminAuth.find({ username: "mosh" });
      expect(admin.length).toBe(1);
    });
  });
});
