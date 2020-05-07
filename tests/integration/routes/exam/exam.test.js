const request = require("supertest");
const mongoose = require("mongoose");
const { Exams } = require("../../../../model/exams/exams");
const { TeachersCourse } = require("../../../../model/teachers/courses");
const { TeacherDetails } = require("../../../../model/teachers/teachers");
let server;

describe("/api/schedule/exams", () => {
  beforeEach(() => {
    server = require("../../../../index");
  });
  afterEach(async () => {
    server.close();
    await Exams.remove({});
    await TeacherDetails.remove({});
    await TeachersCourse.remove({});
  });

  const payload_true = {
    _id: new mongoose.Types.ObjectId().toHexString(),
    teacherID: "12345678",
    username: "Mosh",
    className: "JHS1 A",
    isTeacher: true
  };
  const payload_false = {
    teacherID: "12345678",
    username: "Mosh",
    className: "JHS1 A",
    isTeacher: false
  };

  describe("/post", () => {
    it("Should return 401 if is not a teacher", async () => {
      const teacher = new TeacherDetails(payload_false);
      const token = teacher.generateTeacherAuthToken();
      const res = await request(server)
        .post("/api/schedule/exams")
        .set("x-auth-token", token);
      expect(res.status).toBe(401);
    });

    it("Should return 400 if body is not valid", async () => {
      const teacher = new TeacherDetails(payload_true);
      const token = teacher.generateTeacherAuthToken();
      const res = await request(server)
        .post("/api/schedule/exams")
        .set("x-auth-token", token)
        .send({
          class_name: "df",
          exam_name: "e",
          schedule_date: "2020/11/11",
          subject: "a"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 400 if teacher for that course is not found", async () => {
      await new TeachersCourse({
        name: "Math",
        className: "JHS1 A",
        teacherID: "12345",
        schoolSecretKey: "123456"
      }).save();

      const teacher = new TeacherDetails(payload_true);
      const token = teacher.generateTeacherAuthToken();
      const res = await request(server)
        .post("/api/schedule/exams")
        .set("x-auth-token", token)
        .send({
          className: "JHS2 C",
          exam_name: "Biology test",
          schedule_date: "2020/11/11",
          subject: "Biology"
        });
      expect(res.status).toBe(400);
    });

    it("Should return 401 if teacher is not teaching that subject in that class", async () => {
      await new TeachersCourse({
        name: "Math",
        className: "JHS1 A",
        teacherID: "12345",
        schoolSecretKey: "123456"
      }).save();

      const teacher = new TeacherDetails(payload_true);
      const token = teacher.generateTeacherAuthToken();
      const res = await request(server)
        .post("/api/schedule/exams")
        .set("x-auth-token", token)
        .send({
          className: "JHS1 A",
          exam_name: "Math test",
          schedule_date: "2020/11/11",
          subject: "Math"
        });
      expect(res.status).toBe(401);
    });

    /*it("Should return 200 if teacher is teaching that subject in that class", async () => {
      const teacher = new TeacherDetails(payload_true);
      const token = teacher.generateTeacherAuthToken();
      await new TeachersCourse({
        courseName: "Math",
        className: "JHS1 A",
        teacher: teacher._id
      }).save();

      const res = await request(server)
        .post("/api/schedule/exams/post")
        .set("x-auth-token", token)
        .send({
          class_name: "JHS1 A",
          exam_name: "Math test",
          schedule_date: "2020/11/11",
          subject: "Math",
          teacher: teacher._id
        });
        
      expect(res.status).toBe(200);
    });*/
  });
  describe("update /id", () => {
    /* it("Should return 400 if body is invalid", async () => {
      const exam = await new Exams({
        class_name: "JHS1 A",
        exam_name: "Math test",
        schedule_date: "2020/11/11",
        subject: "Math",
        teacher: new mongoose.Types.ObjectId().toHexString()
      });
      const teacher = new TeacherDetails(payload_false);
      const token = teacher.generateTeacherAuthToken();
      const res = await request(server)
        .update("/api/schedule/exams/post/update/" + exam._id)
        .set("x-auth-token", token)
        .send({
          class_name: "JH",
          exam_name: "M",
          schedule_date: "2020/11/11",
          subject: "M",
          teacher: exam.teacher
        });
      expect(res.status).toBe(400);
    }); */
  });
});
