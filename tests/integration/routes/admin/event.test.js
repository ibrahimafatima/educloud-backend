const request = require("supertest");
const { Event } = require("../../../../model/admin/events");
const { AdminAuth } = require("../../../../model/admin/auth");
let server;

describe("/api/admin/event", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await Event.remove({});
  });

  const payload_true = {
    schoolSecretKey: "1234",
    isAdmin: true,
    username: "ibra",
    password: "12345678"
  };

  describe("POST /", () => {
    it("Should return 400 if request body is falsy", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/event")
        .set("x-auth-token", token)
        .send({
          event_title: "tt",
          event_date: "2020/12/02",
          event_message: "hoo"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 200 if event is saved to db", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/event")
        .set("x-auth-token", token)
        .send({
          event_date: "2020/12/02",
          event_message: "A tournament will be organised soon..."
        });
      expect(res.status).toBe(200);
    });
  });
  describe("GET /", () => {
    it("Should be empty if no event was posted", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .get("/api/admin/event")
        .set("x-auth-token", token);
      const event = await Event.find();
      expect(event.length).toBe(0);
    });

    it("Should return 200 if all is fine", async () => {
      await new Event({
        schoolSecretKey: "1234",
        event_date: "2020/11/11",
        event_message: "It will start tomorrow"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .get("/api/admin/event")
        .set("x-auth-token", token);
      const event = await Event.find({
        $and: [
          { schoolSecretKey: "1234" },
          { event_message: "It will start tomorrow" }
        ]
      });
      expect(event.length).toBe(1);
    });
  });
  describe("PUT /Id", () => {
    it("should return 400 if res body is invalid", async () => {
      const event = await new Event({
        schoolSecretKey: "123456",
        event_date: "2020/11/11",
        event_message: "It will start tomorrow"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/event/" + event._id)
        .set("x-auth-token", token)
        .send({
          event_date: "2020/11/11",
          event_message: "3",
          schoolSecretKey: "123456"
        });
      expect(res.status).toBe(400);
    });

    it("should return 200 if all is fine", async () => {
      const event = await new Event({
        event_title: "Football match",
        event_date: "2020/11/11",
        schoolSecretKey: "123456",
        event_message: "It will start tomorrow"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/event/" + event._id)
        .set("x-auth-token", token)
        .send({
          event_date: "2020/11/11",
          event_message: "It will start soon"
        });
      expect(res.status).toBe(200);
    });
  });
  describe("DELETE /id", () => {
    it("should return 200 if all is fine", async () => {
      const event = await new Event({
        event_date: "2020/11/11",
        event_message: "It will start tomorrow",
        schoolSecretKey: "12345678"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .delete("/api/admin/event/" + event._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
