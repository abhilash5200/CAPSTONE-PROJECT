import exp from "express"
export const authorRouter = exp.Router()

import { register } from "../services/authservice.js"
import { verifyToken } from "../Middlewares/verifyToken.js"
import { checkAuthor } from "../middlewares/checkAuthor.js"
import ArticleModel from "../models/ArticalModel.js"

// NEW IMPORTS (same as user router)
import { upload } from "../conflict/multer.js"
import { uploadToCloudinary } from "../conflict/cloudinaryUpload.js"
import cloudinary from "../conflict/cloudinary.js"


// ======================================================
// REGISTER AUTHOR WITH PROFILE IMAGE (CLOUDINARY)
// ======================================================

authorRouter.post(
  "/users",
  upload.single("profilePic"),   // 
  async (req, res, next) => {

    let cloudinaryResult

    try {

      const userObj = req.body

      // Upload image if exists
      if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer)
      }

      // Register author with image URL
      const newUserObj = await register({
        ...userObj,
        role: "AUTHOR",
        profileImageUrl: cloudinaryResult?.secure_url
      })

      res.status(201).json({
        message: "author created",
        payload: newUserObj
      })

    } catch (err) {

      // rollback if upload succeeded but DB failed
      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id)
      }

      next(err)
    }

  }
)


// ======================================================
// CREATE ARTICLE (NO CHANGE)
// ======================================================

authorRouter.post(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res) => {

    const article = {
      ...req.body,
      author: req.user.userId
    }

    const newArticleDoc = new ArticleModel(article)
    const createdArticleDoc = await newArticleDoc.save()

    res.status(201).json({
      message: "article created",
      payload: createdArticleDoc
    })

  }
)


// ======================================================
// READ AUTHOR ARTICLES 
// ======================================================

authorRouter.get(
  "/articles/:authorId",
  verifyToken("AUTHOR"),
  checkAuthor,
  async (req, res) => {
    const aid = req.params.authorId

    const articles = await ArticleModel.find({
      author: aid
    }).populate("author", "firstName email")

    res.status(200).json({
      message: "articles",
      payload: articles
    })
  }
)


// ======================================================
// UPDATE ARTICLE 
// ======================================================

authorRouter.put(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res) => {

    const { articleId, title, category, content } = req.body

    const articleOfDB = await ArticleModel.findOne({
      _id: articleId,
      author: req.user.userId
    })

    if (!articleOfDB) {
      return res.status(404).json({ message: "Article not found" })
    }

    const updatedArticle = await ArticleModel.findByIdAndUpdate(
      articleId,
      { $set: { title, category, content } },
      { new: true }
    )

    res.status(200).json({
      message: "article updated",
      payload: updatedArticle
    })

  }
)

// ======================================================
// DELETE / RESTORE ARTICLE (NO CHANGE)
// ======================================================

authorRouter.patch(
  "/articles/:id/status",
  verifyToken("AUTHOR"),
  async (req, res) => {

    try {

      const { id } = req.params
      const { isArticleActive } = req.body

      const article = await ArticleModel.findById(id)

      if (!article) {
        return res.status(404).json({ message: "Article not found" })
      }

      if (
        req.user.role === "AUTHOR" &&
        article.author.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Forbidden. You can only modify your own articles"
        })
      }

      if (article.isArticleActive === isArticleActive) {
        return res.status(400).json({
          message: `Article is already ${
            isArticleActive ? "active" : "deleted"
          }`
        })
      }

      article.isArticleActive = isArticleActive
      await article.save()

      res.status(200).json({
        message: `Article ${
          isArticleActive ? "restored" : "deleted"
        } successfully`,
        payload: article
      })

    } catch (err) {
      res.status(500).json({ message: err.message })
    }

  }
)