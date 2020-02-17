const { AdminAuth } = require("../../../../model/admin/auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");

describe("generateAdminAuthToken", () => {
  it("Should return a valid admin json web token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
      username: "Mosh"
    };
    const admin = new AdminAuth(payload);
    const token = admin.generateAdminAuthToken();
    const decoded = jwt.verify(token, config.get("private_key"));
    expect(decoded).toMatchObject(payload);
  });
});
