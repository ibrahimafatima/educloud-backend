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
    password: "12345678",
    currency: "Cedis",
    gender: "Female",
    role: "Admin",
    schoolName: "NOE"
  };

  describe("POST /", () => {
    it("should return 400 if the body validation failed", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/teacher")
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
        addedBy: "mosh",
        role: "teacher",
        schoolSecretKey: "1234",
        numberOfSubject: 0,
        schoolName: "noel",
        classInCharge: "JHS2 A"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/teacher")
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
        addedBy: "mosh",
        role: "teacher",
        schoolSecretKey: "1234",
        numberOfSubject: 0,
        schoolName: "noel",
        classInCharge: "JHS2 A"
      }).save();
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          classInCharge: "JHS2 B"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if the class is already in charge", async () => {
      await new AddClass({
        className: "JHS2 A",
        addedBy: "sakho",
        schoolSecretKey: "1234",
        classe: "JHS2",
        amount_to_pay: 300,
        level: "JHS",
        isInCharge: true
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/teacher")
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
        className: "JHS2 A",
        addedBy: "mosh",
        schoolSecretKey: "1234",
        classe: "JHS2",
        amount_to_pay: 300,
        level: "JHS",
        isInCharge: false
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .post("/api/admin/teacher")
        .set("x-auth-token", token)
        .send({
          teacherID: "6543321",
          username: "MOSH",
          className: "JHS2 A"
        });
      const result = await TeacherDetails.find({ username: "MOSH" });
      const cls = await AddClass.find({ className: "JHS2 A" });
      expect(result[0]).toHaveProperty("username", "MOSH");
      expect(result.length).toBe(1);
      expect(res.status).toBe(200);
      expect(cls.length).toBe(1);
      expect(cls[0].isInCharge).toBe(true);
    });
  });
  describe("GET /", () => {
    it("Should return 400 if no data found", async () => {});

    it("Should return length 0 if no data found", async () => {
      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .get("/api/admin/teacher")
        .set("x-auth-token", token);
      const result = await TeacherDetails.find();
      expect(result.length).toBe(0);
    });
    it("Should send response if all is fine", async () => {
      await new TeacherDetails({
        teacherID: "12345",
        addedBy: "mosh",
        numberOfSubject: 0,
        schoolSecretKey: "12345",
        schoolName: "noel",
        role: "teahcer",
        username: "ibra",
        className: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      await request(server)
        .get("/api/admin/teacher")
        .set("x-auth-token", token);
      const result = await TeacherDetails.find();
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("username", "ibra");
    });
  });
  describe("DELETE /id", () => {
    it("should remove the teacher with the given id", async () => {
      const teacher = await new TeacherDetails({
        teacherID: "12345",
        username: "ibra",
        addedBy: "sakho",
        numberOfSubject: 0,
        schoolSecretKey: "12345678",
        schoolName: "NOEl",
        role: "Admin",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .delete("/api/admin/teacher/" + teacher._id)
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
        addedBy: "sakho",
        numberOfSubject: 0,
        schoolSecretKey: "12345678",
        schoolName: "NOEl",
        role: "Admin",
        classInCharge: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/teacher/" + teacher._id)
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
        addedBy: "sakho",
        numberOfSubject: 0,
        schoolSecretKey: "12345678",
        schoolName: "NOE",
        role: "Admin",
        className: "JHS2 A"
      }).save();

      const admin = new AdminAuth(payload_true);
      const token = admin.generateAdminAuthToken();
      const res = await request(server)
        .put("/api/admin/teacher/" + teacher._id)
        .set("x-auth-token", token)
        .send({
          teacherID: "12345",
          username: "ibrahim",
          className: "JHS2 A"
        });
      const result = await TeacherDetails.find();
      expect(res.status).toBe(200);
      expect(result.length).toBe(1);
      expect(result[0].username).toBe("ibrahim");
    });
  });
});
