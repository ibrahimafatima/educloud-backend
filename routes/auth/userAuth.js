const express = require("express");
const multer = require("multer");
const { Storage } = require('@google-cloud/storage');
const isAuth = require("../../middleware/isAuth");
const { StudentDetails } = require("../../model/students/students_managment");
const { TeacherDetails } = require("../../model/teachers/teachers_managment");
const { AdminAuth, validateLoginAuth, validateRegistrationAuth } = require("../../model/admin/auth");
const { logUserIn, registerUser, resetPassword } = require("../../utilities/auth");

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


router.post("/register", async (req, res) => {
  const {error} = validateRegistrationAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await StudentDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() },
    ],
  });
  const teacher = await TeacherDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() },
    ],
  });

  if (student) {
    registerUser(student, req.body.password, res);
  } else if (teacher) {
    registerUser(teacher, req.body.password, res);
  } else {
    return res.status(400).send("Invalid registration or username");
  }
});

router.post("/login", async (req, res) => {
  const {error} = validateLoginAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    username: req.body.username.trim(),
  });
  const teacher = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  const admin = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });

  if (student) {
    logUserIn(student, req.body.password, res);
  } else if (teacher) {
    logUserIn(teacher, req.body.password, res);
  } else if (admin) {
    logUserIn(admin, req.body.password, res);
  } else {
    return res.status(400).send("Invalid username or password");
  }
});

router.post("/confirm-account", async (req, res) => {
  const studentUser = await StudentDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() },
    ],
  });

  const teacherUser = await TeacherDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() }
    ]
  });

  if (studentUser)
  return res.send(studentUser);
  else if(teacherUser)
  return res.send(teacherUser);
  else
  return res.status(404).send("Invalid username or registrationID");
});

router.post("/reset-password", async (req, res) => {
  const student = await StudentDetails.findOne({
    username: req.body.username.trim(),
    });
  const teacher = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (student)
    resetPassword(student, req.body.password, res);
  else if(teacher)
    resetPassword(teacher, req.body.password, res)
  else 
    return res.status(404).send("invalid username");
});

router.get("/admin/:id", isAuth, async (req, res) => {
  const admin = await AdminAuth.findById(req.params.id)
  if(!admin) return res.status("404").send("Admin not found")
  res.send(admin);
})

router.post('/upload', [uploader.single('file'), isAuth], async(req, res, next) => {

  if(!req.file) {
    return res.status(400).send('No file uploaded')
  }

  let admin = await AdminAuth.findById(req.adminToken._id)
  
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
    admin.profileURL = publicUrl
    await admin.save()
    res
      .status(200)
      .send({ fileName: req.file.originalname, fileLocation: publicUrl });
  });

  // When there is no more data to be consumed from the stream
  blobWriter.end(req.file.buffer);

});


module.exports = router;
