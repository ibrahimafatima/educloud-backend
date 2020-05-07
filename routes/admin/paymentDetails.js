const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { StudentDetails } = require("../../model/students/students");
const { AddClass } = require("../../model/admin/classes");
const {
  PaymentDetails,
  ValidatePaymentDetails,
} = require("../../model/admin/paymentDetails");

const router = express.Router();

//STUDENT MAKING PAYMENT
router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidatePaymentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    $and: [
      { registration_number: req.body.registration_number },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  const classe = await AddClass.findOne({
    className: student.class_name,
  });
  if (student.fee_paid >= classe.amount_to_pay)
    return res.status(400).send("Student already complete payment");
  if (student.fee_paid + parseInt(req.body.amountPaid) > classe.amount_to_pay)
    return res
      .status(400)
      .send(
        `Student amount is left with ${
          classe.amount_to_pay - student.fee_paid
        } to complete payment`
      );

  if (!student)
    return res
      .status(400)
      .send("The student with this registration number doesnt exist");
  const paidFee = new PaymentDetails({
    registration_number: req.body.registration_number,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    amountPaid: req.body.amountPaid,
    class_name: student.class_name,
    operatedBy: req.adminToken.username,
  });
  student.fee_paid += parseInt(req.body.amountPaid);
  await student.save();
  const result = await paidFee.save();
  res.send(result);
});

//GETTING ALL PAYMENT DONE BY A STUDENT
router.get("/:id", [isAuth], async (req, res) => {
  const student = await StudentDetails.findOne({
    $and: [
      { registration_number: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  const paymentInfo = await PaymentDetails.find({
    $and: [
      { registration_number: req.params.id },
      { class_name: student.class_name },
      { status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!paymentInfo) return res.status(404).send("No payment found");
  res.send(paymentInfo);
});

//calculate the total fee paid by a student
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
