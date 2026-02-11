import exp from 'express'
export const adminRouter=exp.Router()
import UserModel from '../models/UserModel.js'
import { verifyToken } from '../Middlewares/verifyToken.js'


//read all articles


//block users
//block user (Protected route)
adminRouter.put("/block", verifyToken, async (req, res, next) => {

  try{

    //get user id
    let { userId } = req.body;

    //find user
    let user = await UserModel.findById(userId);

    //user not found
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    //block user
    user.isActive = false;

    //save
    await user.save();

    //response
    res.status(200).json({
      message: "User blocked successfully",
      payload: user
    });

  }
  catch(err){
    next(err)
  }
});


// //unblock users roles
//unblock user (Protected route)
adminRouter.put("/unblock", verifyToken, async (req, res, next) => {

  try{

    //get user id
    let { userId } = req.body;

    //find user
    let user = await UserModel.findById(userId);

    //user not found
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    //unblock user
    user.isActive = true;

    //save
    await user.save();

    //response
    res.status(200).json({
      message: "User unblocked successfully",
      payload: user
    });

  }
  catch(err){
    next(err)
  }
});
