const request = require("supertest");
const { Exams } = require("../../../../model/exams/exams");
const { StudentDetails } = require("../../../../model/students/students");
let server;

describe("/api/student/my-exams", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
  });

  const payload_false = {
    registration_number: "12345678",
    class_name: "JHS1 A",
    password: "12345678",
    isRegistered: true,
    isStudent: false
  };
  const payload_true = {
    registration_number: "12345678",
    class_name: "JHS1 A",
    password: "12345678",
    isRegistered: true,
    isStudent: true
  };

  describe("GET /", () => {
    it("Should return 401 if not a  student", async () => {
      const student = new StudentDetails(payload_false);
      const token = student.generateStudentToken();
      const res = await request(server)
        .get("/api/student/my-exams")
        .set("x-auth-token", token);
      expect(res.status).toBe(401);
    });

    it("Should return 400 if no exam for student class", async () => {
      const student = new StudentDetails(payload_true);
      await student.save();
      const token = student.generateStudentToken();
      const res = await request(server)
        .get("/api/student/my-exams")
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
