const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { ClassesDetails } = require("../../model/admin/classes_managment");
const { StudentDetails } = require("../../model/students/students_managment");
const {
  PaymentDetails,
  ValidatePaymentDetails,
} = require("../../model/admin/paymentDetails");
const Flutterwave = require("flutterwave-node-v3");
const config = require("config");

const router = express.Router();

//STUDENT MAKING PAYMENT
router.post("/", [isAuth, isAdmin], async (req, res) => {
  // const PUBLIC_KEY = config.get("flutter_wave_public_key");
  // const SECRET_KEY = config.get("flutter_wave_secret_key");
  //const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY);

  // const Gh_mobilemoney = async () => {
  //   try {
  //     const payload = {
  //       tx_ref: "MC-158523s09v5050e8",
  //       amount: "150",
  //       type: "mobile_money_ghana",
  //       currency: "GHS",
  //       voucher: "143256743",
  //       network: "MTN", //This is the customer's mobile money network provider (possible values: MTN, VODAFONE, TIGO)
  //       email: "sakho92iba@gmail.com",
  //       phone_number: "0570153711",
  //       fullname: "Sakho Ibrahima",
  //       meta: {
  //         flightID: "213213AS",
  //       },
  //     };

  //     const response = await flw.MobileMoney.ghana(payload);
  //     console.log(response);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Gh_mobilemoney();
  // res.send("ok");

  const { error } = ValidatePaymentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    $and: [
      { registrationID: req.body.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!student)
    return res
      .status(400)
      .send("The student with this registration ID doesnt exist");

  const classe = await ClassesDetails.findOne({
    $and: [
      { className: student.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (student.feePaid >= classe.amountToPay)
    return res.status(400).send("Student already complete payment");
  if (student.feePaid + parseInt(req.body.amountPaid) > classe.amountToPay)
    return res
      .status(400)
      .send(
        `Student school fee is left with ${
          classe.amountToPay - student.feePaid
        } to complete payment`
      );

  const paidFee = new PaymentDetails({
    registrationID: req.body.registrationID,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    amountPaid: req.body.amountPaid,
    className: student.className,
    operatedBy: req.adminToken.username,
  });
  student.feePaid += parseInt(req.body.amountPaid);
  //FAWN TO BE IMPLEMENTED HERE
  //var task = Fawn.Task();
  await student.save();
  const result = await paidFee.save();
  res.send(result);
});


//GETTING ALL PAYMENT DONE BY A STUDENT
router.get("/get/:id", [isAuth], async (req, res) => {
  const student = await StudentDetails.findOne({
    $and: [
      { registrationID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  const paymentInfo = await PaymentDetails.find({
    $and: [
      { registrationID: req.params.id },
      { className: student.className },
      { status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!paymentInfo) return res.status(404).send("No payment found");
  res.send(paymentInfo);
});

router.get("/info/:id", [isAuth, isAdmin], async (req, res) => {
  const paymentInfo = await PaymentDetails.findOne({
    _id: req.params.id,
  });
  if (!paymentInfo) return res.status(404).send("No payment found");
  res.send(paymentInfo);
});

router.put("/next-year", [isAuth, isAdmin], async (req, res) => {
  const new_term_payment = await PaymentDetails.updateMany(
    { schoolSecretKey: req.adminToken.schoolSecretKey },
    { $set: { status: "Old" } }
  );
  res.send(new_term_payment);
});

module.exports = router;
