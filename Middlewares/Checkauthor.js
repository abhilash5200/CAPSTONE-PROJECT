import UserModel from "../models/UserModel.js";

//middleware to verify author role
export const checkAuthor = async (req, res, next) => {

  //get author id from request body or params
  let aid = req.body?.author || req.params?.authorId;

  //find author in database
  let author = await UserModel.findById(aid);

  //if author not found
  if (!author) {
    return res.status(401).json({ message: "Invalid Author" });
  }

  //if role is not AUTHOR
  if (author.role !== "AUTHOR") {
    return res.status(403).json({ message: "User is not an Author" });
  }

  //if author account inactive
  if (!author.isActive) {
    return res.status(403).json({ message: "Author account is not active" });
  }

  //allow access
  next();
};
