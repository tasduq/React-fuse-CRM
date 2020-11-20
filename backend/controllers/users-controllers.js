const validationResult = require("express-validator").validationResult;
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const HttpError = require("../model/http-error");
const User = require("../model/User");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: user });
};


const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { displayName, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    displayName,
    email,
    password: hashedPassword,
  });

  try {
    createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let access_token;

  try {
    access_token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "jwt_access_token",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
console.log("before response")
  res
    .status(201)
    .json({
      message: "user created",
      role: [createdUser.role],
      displayName:createdUser.displayName,
      userId: createdUser.id,
      email: createdUser.email,
      password: createdUser.password,
      access_token: access_token,
    });
    console.log('user  singin wala   ')
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email , password)

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
    console.log(existingUser)
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  console.log(existingUser)

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let access_token;
  try {
    access_token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "jwt_access_token",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
     message: "you are login success fully ",
     displayName:existingUser.displayName,
    userId: existingUser.id,
    role: [existingUser.role],
    email: existingUser.email,
    password: existingUser.password,
    access_token: access_token,
   } );

   console.log('user di  ')
};
module.exports = { getUsers, signup, login };
