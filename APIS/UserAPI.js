import exp from "express"
import { register } from "../services/authservice.js"
import ArticleModel from "../models/ArticalModel.js"
import { verifyToken } from "../Middlewares/verifyToken.js"

import { upload } from "../conflict/multer.js"
import { uploadToCloudinary } from "../conflict/cloudinaryUpload.js"
import cloudinary from "../conflict/cloudinary.js"

export const userRouter = exp.Router()

// ======================================================
// REGISTER USER WITH PROFILE IMAGE
// ======================================================

userRouter.post(
  "/users",
  upload.single("profilePic"), 
  async (req, res, next) => {

    let cloudinaryResult

    try {

      const userObj = req.body

      //  Upload image if exists
      if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer)
      }

      //  Register user with image URL
      const newUserObj = await register({
        ...userObj,
        role: "USER",
        profileImageUrl: cloudinaryResult?.secure_url
      })

      res.status(201).json({
        message: "user created",
        payload: newUserObj
      })

    } catch (err) {

      // rollback if upload happened but DB failed
      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id)
      }

      next(err)
    }

  }
)

// ======================================================
// READ ALL ARTICLES (NO CHANGE)
// ======================================================

userRouter.get(
  "/articles",
  verifyToken("USER", "AUTHOR"),
  async (req, res) => {

    const articles = await ArticleModel.find({
      isArticleActive: true
    }).populate("author", "firstName email profileImageUrl")

    res.status(200).json({
      message: "All articles",
      payload: articles
    })

  }
)

// ======================================================
// ADD COMMENT 
// ======================================================

userRouter.put(
  "/comment/:articleId",
  verifyToken("USER"),
  async (req, res) => {

    const { comment } = req.body
    const { articleId } = req.params

    const commentObj = {
      user: req.user.userId,
      comment
    }

    const article = await ArticleModel.findOneAndUpdate(
      { _id: articleId, isArticleActive: true },
      { $push: { comments: commentObj } },
      { new: true, runValidators: true }
    ).populate("comments.user", "firstName lastName profileImageUrl")

    if (!article) {
      return res.status(404).json({ message: "Article not found" })
    }

    res.status(200).json({
      message: "comment added",
      payload: article
    })

  }
)