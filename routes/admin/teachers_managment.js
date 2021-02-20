config = require("config");
const Fawn = require("fawn");
const express = require("express");
const multer = require('multer');
const mongoose = require("mongoose");
const { Storage } = require('@google-cloud/storage');
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Exams } = require("../../model/exams/exams");
const { ClassesDetails } = require("../../model/admin/classes_managment");
const { Timetable } = require("../../model/teachers/timetable");
const { Assignment } = require("../../model/teachers/assignment");
const { TeachersCourse } = require("../../model/teachers/courses");
const validateObjectId = require("../../middleware/validateObjectId");
const {
  TeacherDetails,
  validateTeacherDetails,
} = require("../../model/teachers/teachers_managment");
const router = express.Router();

Fawn.init(mongoose);

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


//ADDING A TEACHER TO THE SCHOOL
router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateTeacherDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let teacherById = await TeacherDetails.findOne({
    $and: [
      { registrationID: req.body.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (teacherById)
    return res
      .status(400)
      .send("The teacher with the given ID is already added!");

  let teacherByUsername = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (teacherByUsername)
    return res.status(400).send("The username is already in use!");

  const classToUpdate = await ClassesDetails.findOne({
    $and: [
      { className: req.body.className.trim() },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  console.log(classToUpdate);

  if (classToUpdate.className !== "None" && classToUpdate.isInCharge)
    return res
      .status(400)
      .send(`The class is already in charge by another teacher`);

  const newTeacher = new TeacherDetails({
    role: "Teacher",
    registrationID: req.body.registrationID,
    username: req.body.username.trim(),
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    className: req.body.className,
    addedBy: req.adminToken.username,
    country: req.adminToken.country,
    pack: req.adminToken.pack,
    numberOfSubject: 0,
  });

  classToUpdate.isInCharge = true;
  //USE FAWN HERE LATER
  await classToUpdate.save();
  const result = await newTeacher.save();
  res.send(result);
});

//GET ALL TEACHERS OF A SCHOOL
router.get("/", [isAuth], async (req, res) => {
  const teachers = await TeacherDetails.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("username");
  if (!teachers) return res.status(400).send("Couldnt get teachers list");
  res.send(teachers);
});

//GET A TEACHER BY IT'S registrationID
router.get("/registrationID/:id", [isAuth], async (req, res) => {
  const teacher = await TeacherDetails.findOne({
    $and: [
      { registrationID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!teacher)
    return res.status(404).send("No teacher found with the given ID");
  res.send(teacher);
});

//GET A TEACHER BY MONGODB _id
router.get("/id/:id", [isAuth], async (req, res) => {
  const teacher = await TeacherDetails.findById(req.params.id);
  if (!teacher)
    return res.status(404).send("No teacher was found with the given ID");
  res.send(teacher);
});

//UPDATE A TEACHER DETAILS
router.put(
  "/update/:id",
  [isAuth, isAdmin, validateObjectId],
  async (req, res) => {
    const { error } = validateTeacherDetails(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //DISALLOW USER TO UPDATE THE registrationID
    const t = await TeacherDetails.findById(req.params.id);
    if (t.registrationID !== req.body.registrationID)
      return res.status(400).send("You cannot update registrationID...");

    const classToUpdate = await ClassesDetails.findOne({
      $and: [
        { className: req.body.className },
        { schoolSecretKey: req.adminToken.schoolSecretKey },
      ],
    });
    if (classToUpdate.isInCharge && req.body.className !== t.className)
      return res
        .status(400)
        .send(`The class is already in charge by another teacher`);

    const teacher = await TeacherDetails.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        className: req.body.className,
        lastUpdatedBy: req.adminToken.username,
      },
      { new: true }
    );
    res.send(teacher);
  }
);

router.delete(
  "/delete/:id",
  [isAuth, isAdmin, validateObjectId],
  async (req, res) => {
    const teacherToDelete = await TeacherDetails.findById(req.params.id);
    if (!teacherToDelete) return res.status(404).send("Teacher not found!");
    const course = await TeachersCourse.findOne({
      registrationID: teacherToDelete.registrationID,
    });
    if (course)
      return res
        .status(404)
        .send(
          "Admin or Teacher should clear all his courses before you can delete"
        );
    const timetable = await Timetable.findOne({
      registrationID: teacherToDelete.registrationID,
    });
    if (timetable)
      return res
        .status(404)
        .send(
          "Admin or Teacher should clear all his activities in timetable before you can delete"
        );
    const exams = await Exams.findOne({
      registrationID: teacherToDelete.registrationID,
    });
    if (exams)
      return res
        .status(404)
        .send(
          "Admin or Teacher should clear all exams scheduled before you can delete"
        );
    const assignment = await Assignment.findOne({
      registrationID: teacherToDelete.registrationID,
    });
    if (assignment)
      return res
        .status(404)
        .send(
          "Admin or Teacher should clear all assignment posted before you can delete"
        );

    //Exam, Assignment, Timetable
    const teacher = await TeacherDetails.findByIdAndRemove(req.params.id);
    res.send(teacher);
  }
);

router.post('/upload', [uploader.single('file'), isAuth], async(req, res, next) => {

  if(!req.file) {
    return res.status(400).send('No file uploaded')
  }

  let teacherById = await TeacherDetails.findOne({
    $and: [
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  
  // Create new blob in the bucket referencing the file
  const blob = bucket.file(req.file.originalname);

  // Create writable stream and specifying file mimetype
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  
  blobWriter.on('error', (err) => next(err));

  blobWriter.on('finish', async () => {
    // Assembling public URL for accessing the file via HTTP
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURI(blob.name)}?alt=media`;

    // Return the file name and its public URL
    teacherById.profileURL = publicUrl
    await teacherById.save()
    res
      .status(200)
      .send({ fileName: req.file.originalname, fileLocation: publicUrl });
  });

  // When there is no more data to be consumed from the stream
  blobWriter.end(req.file.buffer);

});

module.exports = router;
