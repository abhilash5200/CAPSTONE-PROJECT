import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

//middleware to check whether user is logged in or not
export const verifyToken = (...allowedRoles) => {

  return async (req, res, next) => {

    try{

      //read token from cookies
      let token = req.cookies.token;

      //if token not present → user not logged in
      if (!token) {
        return res.status(401).json({ message: "Unauthorized req. Please login" });
      }

      //verify token validity AND decode payload
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      //check if role is allowed
      if(!allowedRoles.includes(decodedToken.role)){
        return res.status(403).json({ message: "Forbidden. You don't have access to this resource" });
      }

      req.user = decodedToken;

      //forward request
      next();

    }
    catch(err){
      if(err.name === "TokenExpiredError"){
        return res.status(401).json({ message: "Token expired. Please login again" });
      }
      if(err.name === "JsonWebTokenError"){
        return res.status(401).json({ message: "Invalid token. Please login again" });
      }

      next(err);
    }
  }
};