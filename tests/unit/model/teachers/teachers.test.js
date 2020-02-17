const { TeacherDetails } = require("../../../../model/teachers/teachers");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");

describe("generateTeacherAuthToken", () => {
  it("Should return a valid teacher json web token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      teacherID: "R5434365543",
      username: "sakho",
      classInCharge: "JHS1 C",
      isTeacher: true
    };
    const teacher = new TeacherDetails(payload);
    const token = teacher.generateTeacherAuthToken();
    const decoded = jwt.verify(token, config.get("private_key"));
    expect(decoded).toMatchObject(payload);
  });
});
