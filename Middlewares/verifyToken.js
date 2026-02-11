import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

//middleware to check whether user is logged in or not
export const verifyToken = (req, res, next) => {

  try{

    //read token from cookies
    let token = req.cookies.token;

    //if token not present → user not logged in
    if (!token) {
      return res.status(401).json({ message: "Unauthorized req. Please login" });
    }

    //verify token validity AND decode payload
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = decodedToken;

    //forward request
    next();

  }
  catch(err){
    return res.status(401).json({ message: "Token expired or invalid. Login again" });
  }
};
