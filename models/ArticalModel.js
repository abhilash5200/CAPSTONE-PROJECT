import mongoose from "mongoose";

const { Schema } = mongoose;

const userCommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  comment: {
    type: String
  }
});

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

  isArticleActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  strict: "throw",
  versionKey: false
});

export default mongoose.models.Artical || mongoose.model("Artical", articalSchema);