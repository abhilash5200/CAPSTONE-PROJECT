import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
//import { commonRouter } from "../APIS/CommonAPI.js";




//REGISTER FUNCTION 

export const register = async (userObj) => {

  //create document
  const userDoc = new UserModel(userObj);

  //validate fields
  await userDoc.validate();

  //hash password
  userDoc.password = await bcrypt.hash(userDoc.password, 10);

  //save to database
  const created = await userDoc.save();

  //remove password before sending
  const newUserObj = created.toObject();
  delete newUserObj.password;

  return newUserObj;
};


//AUTHENTICATE FUNCTION 

export const authenticate = async ({ email, password }) => {

  //find user with email and role
  const user = await UserModel.findOne({ email });

  if (!user) {
    const err = new Error("Invalid email ");
    err.status = 401;
    throw err;
  }

  //compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("Invalid password");
    err.status = 401;
    throw err;
  }

  //check isActive state
  if (user.isActive === false) {
    const err = new Error("your account is blocked .plz conatct admin");
    err.status = 403;
    throw err;
  }
  

  //generate jwt token
  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  //remove password
  const userObj = user.toObject();
  delete userObj.password;

  return { token, user: userObj };
};
