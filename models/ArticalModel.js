import mongoose from "mongoose";

const { Schema } = mongoose;


//COMMENT SCHEMA 
const userCommentSchema = new Schema({

  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  comment: {
    type: String
  }
});


//ARTICLE SCHEMA 
const articalSchema = new Schema({

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "author is required"]
  },

  title: {
    type: String,
    required: [true, "title is required"]
  },

  category: {
    type: String,
    required: [true, "category is required"]
  },

  content: {
    type: String,
    required: [true, "content is required"]
  },

  comments: [userCommentSchema],

  isArticalActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  versionKey: false
});


//safe export
export default mongoose.models.Artical || mongoose.model("Artical", articalSchema);
