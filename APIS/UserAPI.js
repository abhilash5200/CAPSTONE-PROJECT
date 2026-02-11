import exp from "express";
import { register, authenticate } from "../services/authservice.js";
import ArticleModel from "../models/ArticalModel.js";
import { verifyToken } from "../Middlewares/verifyToken.js";

export const userRouter = exp.Router();


//REGISTER USER 

userRouter.post("/users", async (req, res) => {

  //get user object
  let userObj = req.body;

  //register with USER role
  const newUserObj = await register({ ...userObj, role: "USER" });

  res.status(201).json({ message: "user created", payload: newUserObj });
});


//LOGIN USER



// READ ALL ARTICLES 

userRouter.get("/articles", verifyToken, async (req, res) => {

  //fetch all active articles
  let articles = await ArticleModel.find({
    isArticalActive: true
  }).populate("author", "firstName email profileImageUrl");

  res.status(200).json({ message: "All articles", payload: articles });
});


// ADD COMMENT 

userRouter.put("/comment/:articleId", verifyToken, async (req, res) => {

  //get userId and comment
  let { userId, comment } = req.body;
  let { articleId } = req.params;

  //prepare comment object
  let commentObj = {
    user: userId,
    comment: comment
  };

  //push comment into article
  let article = await ArticleModel.findByIdAndUpdate(
    articleId,
    { $push: { comments: commentObj } },
    { new: true }
  ).populate("comments.user", "firstName");

  //send response
  res.status(200).json({
    message: "comment added",
    payload: article
  });
});
