const { unhash, hash } = require("./hashed");

module.exports.logUserIn = async (user, userPassword, response) => {
  if (!user.password)
    return response.status(400).send("You need to register first.");
  const isValidPass = await unhash(userPassword.trim(), user.password);
  if (!isValidPass)
    return response.status(400).send("Invalid username or password");
  const token = user.generateAuthToken();
  response.header("x-auth-token", token).send(token);
};

module.exports.registerUser = async (user, userPassword, response) => {
  if (user.password)
    return response.status(400).send("User already registered");
  const hashedPassword = await hash(userPassword.trim());
  if (!user.isStudent) user.isStudent = true;
  else user.isTeacher = true;
  user.password = hashedPassword;
  await user.save();
  const token = user.generateAuthToken();
  response.header("x-auth-token", token).send(token);
};

module.exports.resetPassword = async (user, userPassword, response) => {
  const newHashedPassword = await hash(userPassword.trim());
  user.password = newHashedPassword;
  await user.save();
  response.send("Ok");
}