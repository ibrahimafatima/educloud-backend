const request = require("supertest");
const { StudentDetails } = require("../../../../model/students/students");
let server;
const mongoose = require("mongoose");

describe("/api/student/profile", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await StudentDetails.remove({});
  });
  const payload = {
    registration_number: "12345678",
    class_name: "JHS1 A",
    password: "12345678",
    isRegistered: true,
    isStudent: true
  };
  describe("post me/", () => {
    it("Should return 404 if student with the given id in token does not exist", async () => {
      const student = new StudentDetails(payload);
      const token = student.generateStudentToken();
      const res = await request(server)
        .post("/api/student/profile/me")
        .set("x-auth-token", token);
      //const result = await StudentDetails.findById(student._id);
      expect(res.status).toBe(404);
    });

    it("Should send response if all is fine", async () => {
      const student = new StudentDetails(payload);
      await student.save();
      const token = student.generateStudentToken();
      const res = await request(server)
        .post("/api/student/profile/me")
        .set("x-auth-token", token);
      //const result = await StudentDetails.findById(student._id);
      expect(res.status).toBe(200);
    });
  });
  describe("update/me", () => {
    it("Should return 400 if body is incorrect", async () => {
      const student = new StudentDetails(payload);
      const result = await student.save();
      const token = student.generateStudentToken();
      const res = await request(server)
        .put("/api/student/profile/update/me")
        .set("x-auth-token", token);
      const stUpdate = await StudentDetails.findById(result._id);
      (stUpdate.first_name = "a"),
        (stUpdate.last_name = "a"),
        expect(res.status).toBe(400);
    });

    it("Should return 400 if the student to update with the given id does not exist", async () => {
      const student = new StudentDetails(payload);
      //const result = await student.save();
      const token = student.generateStudentToken();
      const res = await request(server)
        .put("/api/student/profile/update/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });
  });
});
