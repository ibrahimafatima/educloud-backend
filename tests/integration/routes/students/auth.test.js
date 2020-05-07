const request = require("supertest");
let server;
const bcrypt = require("bcrypt");
const { StudentDetails } = require("../../../../model/students/students");

describe("/api/student/auth", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await StudentDetails.remove({});
  });
  describe("/register", () => {
    it("Should return 400 if body is not valid", async () => {
      const res = await request(server)
        .post("/api/student/auth/register")
        .send({
          registration_number: "12345",
          class_name: "ib",
          password: "123"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if registration number is invalid", async () => {
      const res = await request(server)
        .post("/api/student/auth/register")
        .send({
          registration_number: "1234567890",
          class_name: "JHS2 A",
          password: "12345678"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if credentials are already in use", async () => {
      await new StudentDetails({
        registration_number: "12345678",
        class_name: "JHS1 A",
        password: "12345678",
        isStudent: true,
        schoolName: "niit",
        role: "student",
        schoolSecretKey: "12345",
        isRegistered: true
      }).save();

      const res = await request(server)
        .post("/api/student/auth/register")
        .send({
          registration_number: "12345678",
          class_name: "Jhs3 Z",
          password: "12345678"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 200 if all is well", async () => {
      await new StudentDetails({
        registration_number: "12345678",
        class_name: "JHS1 A",
        isStudent: true,
        schoolSecretKey: "12345",
        schoolName: "noel",
        role: "student",
        isRegistered: false
      }).save();

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);

      const res = await request(server)
        .post("/api/student/auth/register")
        .send({
          registration_number: "12345678",
          class_name: "JHS1 A",
          password: hashedPassword
        });
      const student = await StudentDetails.find({
        registration_number: "12345678"
      });
      expect(res.status).toBe(200);
      expect(student.length).toBe(1);
      expect(student[0].isRegistered).toBe(true);
    });
  });
  describe("/login", () => {
    it("Should return 400 if body is not valid", async () => {
      const res = await request(server)
        .post("/api/student/auth/login")
        .send({
          registration_number: "1",
          class_name: "JHS2 A",
          password: "123"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if registration number is invalid", async () => {
      const res = await request(server)
        .post("/api/student/auth/login")
        .send({
          registration_number: "1234567890",
          class_name: "JHS2 A",
          password: "12345678"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if registration number is valid but no password", async () => {
      await new StudentDetails({
        registration_number: "12345678",
        class_name: "JHS1 A",
        isStudent: true,
        schoolName: "noel",
        schoolSecretKey: "12345",
        role: "studdent",
        isRegistered: false
      }).save();

      const res = await request(server)
        .post("/api/student/auth/login")
        .send({
          registration_number: "12345678",
          class_name: "JHS1 A",
          password: "12345678"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if password is incorrect", async () => {
      await new StudentDetails({
        registration_number: "12345678",
        class_name: "JHS1 A",
        isStudent: true,
        schoolName: "noel",
        schoolSecretKey: "12345",
        role: "student",
        password: "12345678",
        isRegistered: true
      }).save();

      const res = await request(server)
        .post("/api/student/auth/login")
        .send({
          registration_number: "12345678",
          password: "1234567890"
        });
      expect(res.status).toBe(400);
    });
  });
});
