const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const paymentDetails = new mongoose.Schema({
  registrationID: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  operatedBy: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: new Date(),
  },
  status: {
    type: String,
    required: true,
    default: "New",
  },
});

function validatePaymentDetails(payment) {
  const schema = Joi.object({
    registrationID: Joi.string().required(),
    amountPaid: Joi.string().required(),
  });
  return schema.validate(payment);
}

const PaymentDetails = mongoose.model("payment_details", paymentDetails);

module.exports.PaymentDetails = PaymentDetails;
module.exports.ValidatePaymentDetails = validatePaymentDetails;
