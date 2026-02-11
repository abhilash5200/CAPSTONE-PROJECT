import exp from 'express'
import { authenticate } from '../services/authservice.js'
import { verifyToken } from '../Middlewares/verifyToken.js'
import bcrypt from 'bcryptjs'
import UserModel from '../models/UserModel.js'

export const commonRouter=exp.Router()


//login
commonRouter.post("/login",async(req,res)=>{
    //get credentials
      let userCred = req.body;
    
      //call authentication service
      let { token, user } = await authenticate(userCred);
    
      //store token as httpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });
    
      //send logged in user details
      res.status(200).json({ message: "login success", payload: user });

})
//logout
commonRouter.post("/logout",async(req,res)=>{
     //clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });

  res.status(200).json({ message: "Logged out successfully" });

})

//password update/change
commonRouter.put('/change-password', verifyToken, async (req, res, next) => {

  try{

    //get email, current password and new password
    let { email, currentPassword, newPassword } = req.body;

    //token user data
    let tokenUser = req.user;

    //check email matches logged-in user
    if(email !== tokenUser.email){
      return res.status(403).json({ message: "Email does not match logged in user" });
    }

    //find user in DB
    let user = await UserModel.findById(tokenUser.userId);

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    //check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if(!isMatch){
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });

  }
  catch(err){
    next(err)
  }
});
