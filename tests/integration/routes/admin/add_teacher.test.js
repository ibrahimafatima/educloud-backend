const request = require("supertest");
const { AdminAuth } = require("../../../../model/admin/auth");
const { AddClass } = require("../../../../model/admin/classes");
const { TeacherDetails } = require("../../../../model/teachers/teachers");
let server;

describe("/api/admin/add/teacher", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await TeacherDetails.remove({});
    await AddClass.remove({});
  });

  const payload_true = {
    schoolSecretKey: "1234",
    isAdmin: true,
    username: "ibra",
    password: "12345678"
  };

  describe("POST /", () => {
    it("should return 400 if the body validation failed", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "R3263",
          username: "ib",
          classInCharge: "JH"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if the teacher with teacherID already exist", async () => {
      await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        classInCharge: "JHS2 A"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "12345",
          username: "MOSH",
          classInCharge: "JHS2 C"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if username is in use", async () => {
      await new TeacherDetails({
        teacherID: "12345",
        username: "MOSH",
        classInCharge: "JHS2 A"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          classInCharge: "JHS2 B"
        });
      expect(res.status).toBe(400);
    });

    it("Should save teacher details if class in charge does not exist", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          classInCharge: "none"
        });
      const result = await TeacherDetails.find({ username: "MOSH" });
      expect(result[0]).toHaveProperty("username", "MOSH");
      expect(result.length).toBe(1);
    });

    it("Should return 400 if the class is already in charge", async () => {
      await new AddClass({
        name: "JHS2 A",
        classe: "JHS2",
        amount_to_pay: 300,
        level: "JHS",
        isInCharge: true
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          classInCharge: "JHS2 A"
        });

      expect(res.status).toBe(400);
    });

    it("Should update class in charge to true and save teacher details", async () => {
      await new AddClass({
        name: "JHS2 A",
        classe: "JHS2",
        amount_to_pay: 300,
        level: "JHS",
        isInCharge: false
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/add/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          classInCharge: "JHS2 A"
        });
      const result = await TeacherDetails.find({ username: "MOSH" });
      const cls = await AddClass.find({ name: "JHS2 A" });
      expect(result[0]).toHaveProperty("username", "MOSH");
      expect(result.length).toBe(1);
      expect(res.status).toBe(200);
      expect(cls.length).toBe(1);
      expect(cls[0].isInCharge).toBe(true);
      expect(res.body).toHaveProperty("username", "MOSH");
    });
  });
  describe("GET /", () => {
    it("Should return 400 if no data found", async () => {});

    it("Should return length 0 if no data found", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .get("/api/admin/add/teacher")
        .set("x-auth-token", token);
      const result = await TeacherDetails.find();
      expect(result.length).toBe(0);
    });
  });
  it("Should send response if all is fine", async () => {
    await new TeacherDetails({
      teacherID: "12345",
      username: "ibra",
      classInCharge: "JHS2 A"
    }).save();

    const admin = new AdminAuth(payload_true);
    const token = admin.generateAdminAuthToken();
    await request(server)
      .get("/api/admin/add/teacher")
      .set("x-auth-token", token);
    const result = await TeacherDetails.find();
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty("username", "ibra");
  });
  describe("GET /teacherId", () => {
    it("Should send particular teacher details if it exist", async () => {
      await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .get("/api/admin/add/teacher/12345")
        .set("x-auth-token", token);
      const teacher = await TeacherDetails.find({ teacherID: "12345" });
      expect(res.status).toBe(200);
      expect(teacher.length).toBe(1);
      expect(teacher[0].username).toBe("ibra");
    });

    it("Should return 404 if user details not found", async () => {});
  });
  describe("DELETE /id", () => {
    it("should remove the teacher with the given id", async () => {
      const teacher = await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .delete("/api/admin/add/teacher/" + teacher._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("teacherID", "12345");
    });
  });

  describe("PUT /id", () => {
    it("should return 400 if teacher details to update is invalid", async () => {
      const teacher = await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/add/teacher/" + teacher._id)
        .set("x-auth-token", token)
        .send({
          teacherID: "12345",
          username: "i",
          classInCharge: "JH"
        });
      expect(res.status).toBe(400);
    });

    it("should update teacher details", async () => {
      const teacher = await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/add/teacher/" + teacher._id)
        .set("x-auth-token", token)
        .send({
          teacherID: "12345",
          username: "ibrahim",
          classInCharge: "JHS2 A"
        });
      const result = await TeacherDetails.find();
      expect(res.status).toBe(200);
      expect(result.length).toBe(1);
      expect(result[0].username).toBe("ibrahim");
    });
  });
});
