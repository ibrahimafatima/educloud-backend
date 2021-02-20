const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { ValidateObjectId } = require("../../validation/validate_objectId");
const { Storage } = require('@google-cloud/storage');
const {
  StudentDetails,
  validateStudentDetails,
} = require("../../model/students/students_managment");

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

//HERE THE TEACHER CAN ONLY ADD THE CLASSES WHERE HE/SHE TEACHES
//AND I AM JUST SIMULATING THE CLASS IN THE BODY HERE IN THE
//REAL APP THE CLASS WILL BE SET AUTOMATICALLY SINCE THE TEACHER
//WILL HAVE TO CLICK ON THE CLASS TO ADD.
router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = validateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.adminToken.className !== req.body.className)
    return res
      .status(401)
      .send(
        `You do not have permission to add student in ${req.body.className}`
      );

  const studentByRegistration = await StudentDetails.findOne({
    $and: [
      { registrationID: req.body.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (studentByRegistration)
    return res
      .status(400)
      .send("The student with this registration number is already added");
  const studentByUsername = await StudentDetails.findOne({
    username: req.body.username.trim(),
  });
  if (studentByUsername)
    return res.status(400).send("The username is already in use!");
  const studentAdded = new StudentDetails({
    username: req.body.username.trim(),
    registrationID: req.body.registrationID,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    className: req.body.className,
    term: req.body.term,
    schoolName: req.adminToken.schoolName,
    role: "Student",
    country: req.adminToken.country,
    pack: req.adminToken.pack,
    isRegistered: true
  });
  const result = await studentAdded.save();
  res.send(result);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) return res.send("Invalid id type");
  const { error } = validateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const studentInfo = await StudentDetails.findById(req.params.id);
  if (!studentInfo) return res.status(400).send("No such student found!");

  if (studentInfo.registrationID !== req.body.registrationID)
    return res
      .status(400)
      .send("You cannot update a registration number. Delete an add back!");

  if (studentInfo.className !== req.body.className)
    return res.status(400).send("You cannot update student class name");

  const student = await StudentDetails.findByIdAndUpdate(
    req.params.id,
    {
      className: req.body.className,
      username: req.body.username,
      term: req.body.term,
    },
    { new: true }
  );
  if (!student) return res.status(400).send("The student does not exist");
  res.send(student);
});

router.get("/", [isAuth], async (req, res) => {
  const students = await StudentDetails.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("username");
  if (!students) return res.status(400).send("Couldnt get students list");
  res.send(students);
});

router.get("/classname/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.find({
    $and: [
      { className: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.get("/reg/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.findOne({
    $and: [
      { registrationID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.get("/ID/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.findById(req.params.id);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateObjectId(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await StudentDetails.findByIdAndRemove(req.params.id);
  if (!result)
    return res.status(404).send("No student found with the given id");
  res.send(result);
});

router.delete("/all", [isAuth, isTeacher], async (req, res) => {
  const students = await StudentDetails.find({
    className: req.body.className,
  }).remove();
  res.send(students);
});

//MOVE CLASS TO NEXT TERM
router.put("/next-term", [isAuth, isTeacher], async (req, res) => {
  if (req.adminToken.className !== req.body.className)
    return res
      .status(401)
      .send(
        `You do not have permission to mofify student details in ${req.body.className}`
      );
  const new_term_student = await StudentDetails.updateMany(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { className: req.adminToken.className },
      ],
    },
    { $set: { term: req.body.term } }
  );
  res.send(new_term_student);
});

//MOVE CLASS TO NEXT YEAR
router.put("/next-year", [isAuth, isTeacher], async (req, res) => {
  const student = await StudentDetails.findOne({
    $and: [
      { registrationID: req.body.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!student) return res.status(404).send("No such student found");

  const new_year_student = await StudentDetails.update(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { registrationID: req.body.registrationID },
        { className: req.adminToken.className },
      ],
    },
    {
      $set: {
        className: req.body.className,
        term: req.body.term,
        fee_paid: 0,
      },
    }
  );
  res.send(new_year_student);
});

router.post('/upload', [uploader.single('file'), isAuth], async(req, res, next) => {

  if(!req.file) {
    return res.status(400).send('No file uploaded')
  }

  const studentByRegistration = await StudentDetails.findOne({
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
    studentByRegistration.profileURL = publicUrl
    await studentByRegistration.save()
    res
      .status(200)
      .send({ fileName: req.file.originalname, fileLocation: publicUrl });
  });

  // When there is no more data to be consumed from the stream
  blobWriter.end(req.file.buffer);

});

module.exports = router;


