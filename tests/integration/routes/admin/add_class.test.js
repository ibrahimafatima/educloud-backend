const request = require("supertest");
const { AdminAuth } = require("../../../../model/admin/auth");
const { AddClass } = require("../../../../model/admin/classes");
let server;

describe("/api/add/class", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await AddClass.remove({});
  });

  const payload_false = {
    schoolSecretKey: "1234",
    isAdmin: false,
    username: "ibra",
    password: "12345678"
  };

  const payload_true = {
    schoolSecretKey: "1234",
    isAdmin: true,
    username: "ibra",
    password: "12345678"
  };
  describe("GET /", () => {
    // 5 EXECUTION PATH
    it("Should return 401 if client is not logged in", async () => {
      const res = await request(server).get("/api/add/class");
      expect(res.status).toBe(401);
    });

    it("should return 404 if token is invalid", async () => {
      const token = 1;
      const res = await request(server)
        .get("/api/add/class")
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 401 if is not an admin", async () => {
      const admin = new AdminAuth(payload_false);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .get("/api/add/class")
        .set("x-auth-token", token);
      expect(res.status).toBe(401);
    });

    it("should return 400 if no class is found", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .get("/api/add/class")
        .set("x-auth-token", token);
      const classes = await AddClass.find();
      expect(classes.length).toBe(0);
    });
    it("should return 200 and body value if all is fine", async () => {
      await AddClass.collection.insertMany([
        {
          name: "jhs1",
          classe: "jhs",
          amount_to_pay: 300,
          level: "jhs",
          isInCharge: true
        },
        {
          name: "jhs2",
          classe: "jhs",
          amount_to_pay: 300,
          level: "jhs",
          isInCharge: true
        }
      ]);
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .get("/api/add/class")
        .set("x-auth-token", token);
      const classes = await AddClass.find();
      expect(classes.length).toBe(2);
      expect(res.status).toBe(200);
      expect(res.body[1]).toHaveProperty("name", "jhs2");
    });
  });
  describe("POST", () => {
    it("Should return 401 if client is not logged in", async () => {
      const res = await request(server).post("/api/add/class");
      expect(res.status).toBe(401);
    });

    it("should return 404 if token is invalid", async () => {
      const token = 1;
      const res = await request(server)
        .post("/api/add/class")
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 401 if is not an admin", async () => {
      const admin = new AdminAuth(payload_false);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/add/class")
        .set("x-auth-token", token);
      expect(res.status).toBe(401);
    });

    it("should return 400 if body is invalid", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/add/class")
        .set("x-auth-token", token)
        .send({
          name: "j"
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if class already exist", async () => {
      await AddClass.collection.insertOne({
        name: "JHS2 A",
        amount_to_pay: 1000,
        level: "JHS",
        classe: "JHS2"
      });
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/add/class")
        .set("x-auth-token", token)
        .send({
          name: "JHS2 A",
          amount_to_pay: 1000,
          level: "JHS",
          classe: "JHS2"
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if class already exist", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/add/class")
        .set("x-auth-token", token)
        .send({
          name: "JHS2 A",
          amount_to_pay: 1000,
          level: "JHS",
          classe: "JHS2"
        });

      const cls = await AddClass.find({ name: "JHS2 A" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "JHS2 A");
      expect(cls).not.toBeNull();
    });
  });
  describe("DELETE /id", () => {
    it("should return 404 if id is invalid", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .delete("/api/add/class/1")
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 200 if id is valid", async () => {
      const cls = await new AddClass({
        name: "JHS2 A",
        amount_to_pay: 1000,
        level: "JHS",
        classe: "JHS2"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .delete("/api/add/class/" + cls._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("classe", "JHS2");
    });
  });
  describe("PUT /id", () => {
    it("should return 404 if id is invalid", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/add/class/1")
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 400 if id is valid but such class already exist", async () => {
      const cls = await new AddClass({
        name: "JHS2 A",
        amount_to_pay: 1000,
        level: "JHS",
        classe: "JHS2"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/add/class/" + cls._id)
        .set("x-auth-token", token)
        .send({ name: "JHS2 A" });

      expect(res.status).toBe(400);
    });

    it("should return 200 if all is fine", async () => {
      const cls = await new AddClass({
        name: "JHS2 A",
        amount_to_pay: 1000,
        level: "JHS",
        classe: "JHS2"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/add/class/" + cls._id)
        .set("x-auth-token", token)
        .send({ name: "JHS2 B" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "JHS2 B");
    });
  });
});
