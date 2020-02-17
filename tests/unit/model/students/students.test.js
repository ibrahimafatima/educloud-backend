const { StudentDetails } = require("../../../../model/students/students");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");

describe("generateStudentToken", () => {
  it("Should return a valid student json web token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      registration_number: "R5434365543",
      class_name: "JHS2 A",
      isStudent: true
    };
    const student = new StudentDetails(payload);
    const token = student.generateStudentToken();
    const decoded = jwt.verify(token, config.get("private_key"));
    expect(decoded).toMatchObject(payload);
  });
});
