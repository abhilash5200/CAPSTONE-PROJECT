import exp from "express";
export const authorRouter = exp.Router();

import { register, authenticate } from "../services/authservice.js";
import { verifyToken } from "../Middlewares/verifyToken.js";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import ArticleModel from "../models/ArticalModel.js";


// REGISTER AUTHOR 

//public route to register author
authorRouter.post("/users", async (req, res) => {

  //get user object from request
  let userObj = req.body;

  //call register service and force role AUTHOR
  const newUserObj = await register({ ...userObj, role: "AUTHOR" });

  //send response
  res.status(201).json({ message: "author created", payload: newUserObj });
});


//LOGIN AUTHOR 




//CREATE ARTICLE 

//protected route → only logged in author
authorRouter.post("/articles", verifyToken, checkAuthor, async (req, res) => {

  //get article from request body
  let article = req.body;

  //create article document
  let newArticleDoc = new ArticleModel(article);

  //save to database
  let createdArticleDoc = await newArticleDoc.save();

  //send response
  res.status(201).json({ message: "article created", payload: createdArticleDoc });
});


//READ AUTHOR ARTICLES 

//get all articles written by specific author
authorRouter.get("/articles/:authorId", verifyToken, checkAuthor, async (req, res) => {

  //get author id from params
  let aid = req.params.authorId;

  //fetch active articles
  let articles = await ArticleModel.find({
    author: aid,
    isArticalActive: true
  }).populate("author", "firstName email");

  //send response
  res.status(200).json({ message: "articles", payload: articles });
});


//UPDATE ARTICLE 

authorRouter.put("/articles", verifyToken, checkAuthor, async (req, res) => {

  //get updated fields from request
  let { articleId, title, category, content, author } = req.body;

  //check ownership of article
  let articleOfDB = await ArticleModel.findOne({
    _id: articleId,
    author: author
  });

  if (!articleOfDB) {
    return res.status(401).json({ message: "Article not found" });
  }

  //update article
  let updatedArticle = await ArticleModel.findByIdAndUpdate(
    articleId,
    { $set: { title, category, content } },
    { new: true }
  );

  //send response
  res.status(200).json({ message: "article updated", payload: updatedArticle });
});

//delete(soft delete) article(Protected route)
authorRouter.delete("/articles", verifyToken, checkAuthor, async (req, res) => {

  //get article id and author id from request
  let { articleId, author } = req.body;

  //check article ownership
  let articleOfDB = await ArticleModel.findOne({
    _id: articleId,
    author: author
  });

  //if article not found or belongs to another author
  if (!articleOfDB) {
    return res.status(401).json({ message: "Article not found" });
  }

  //soft delete → mark inactive
  let deletedArticle = await ArticleModel.findByIdAndUpdate(
    articleId,
    { $set: { isArticalActive: false } },
    { new: true }
  );

  //send response
  res.status(200).json({
    message: "article deleted",
    payload: deletedArticle
  });
});
