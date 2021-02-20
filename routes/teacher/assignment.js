const express = require("express");
const { notify } = require("../pusher/notify");
const multer = require("multer");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const isStudent = require("../../middleware/isStudent");
const { Storage } = require("@google-cloud/storage");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentDetails } = require("../../model/students/students_managment");
const transporter = require("../../utilities/mail_transport");
const {
  Assignment,
  ValidateAssignment,
} = require("../../model/teachers/assignment");

const router = express.Router();

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
  },
});

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateAssignment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const verifyClass = await TeachersCourse.findOne({
    $and: [
      { name: req.body.name.toUpperCase() },
      { className: req.body.className },
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!verifyClass)
    return res
      .status(400)
      .send(
        `You cannot post ${req.body.name} assignment to ${req.body.className}`
      );

  const newAssignment = new Assignment({
    title: req.body.title,
    homeworkURL: req.body.homeworkURL,
    className: req.body.className,
    registrationID: req.adminToken.registrationID,
    postedBy: req.adminToken.username,
    name: req.body.name.toUpperCase(),
    toBeSubmittedOn: req.body.toBeSubmittedOn,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newAssignment.save();
  // const result = await newAssignment.save((err, obj) => {
  //   const school = req.adminToken.schoolName;
  //   notify(school, "assignment");
  // });
  const students = await StudentDetails.find({
    $and: [
      { schoolSecretKey: req.adminToken.schoolSecretKey },
      { className: req.body.className },
      { email: { $ne: "Not Specified" } },
    ],
  });

  students.map((s) => {
    var mailOptions = {
      from: "edukloud@gmail.com",
      to: s.email,
      subject: `Edukloud - New Homework from ${req.adminToken.username}`,
      html: `<h3>Your ${req.body.name.toUpperCase()} teacher has posted a homework.</h3><br/><br/><h4><a href="${
        req.body.homeworkURL
      }">Click to view Homework</a></h4><br/><br/><span><b>Good luck!</b></span><br/><br/><span>Edukloud, Africa's education on a single cloud.</span>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) console.log(error);
      else console.log("Email sent: " + info.response);
    });
  });

  res.send(result);
});

router.get("/", [isAuth], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  })
    .limit(3)
    .sort("-postedOn");
  if (!assignment) return res.status(404).send("  Assignment not found");
  res.send(assignment);
});

router.get("/student", [isAuth, isStudent], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { className: req.adminToken.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-postedOn");
  if (!assignment) return res.status(404).send("Assignment not found");
  res.send(assignment);
});

router.get("/teacher", [isAuth, isTeacher], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-postedOn");
  if (!assignment) return res.status(404).send("Assignment not found");
  res.send(assignment);
});

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(400).send("The assignment does not exist");
  const result = await assignment.remove();
  res.send(result);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      homeworkURL: req.body.homeworkURL,
      name: req.body.name.toUpperCase(),
      className: req.body.className,
      toBeSubmittedOn: req.body.toBeSubmittedOn,
    },
    { new: true }
  );
  if (!assignment) return res.status(400).send("Update cannot be committed");
  res.send(assignment);
});

router.put("/next-year", [isAuth, isTeacher], async (req, res) => {
  const new_year_assignment = await Assignment.updateMany(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { registrationID: req.adminToken.registrationID },
      ],
    },
    { $set: { status: "Old" } }
  );
  res.send(new_year_assignment);
});

router.post(
  "/upload",
  [uploader.single("file"), isAuth],
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Create new blob in the bucket referencing the file
    const blob = bucket.file(req.file.originalname);

    // Create writable stream and specifying file mimetype
    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobWriter.on("error", (err) => next(err));

    blobWriter.on("finish", async () => {
      // Assembling public URL for accessing the file via HTTP
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

      // Return the file name and its public URL
      res
        .status(200)
        .send({ fileName: req.file.originalname, fileLocation: publicUrl });
    });
    console.log();
    // When there is no more data to be consumed from the stream
    blobWriter.end(req.file.buffer);
  }
);

module.exports = router;
