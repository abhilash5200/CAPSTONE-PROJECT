import mongoose from "mongoose";

const { Schema } = mongoose;

//USER SCHEMA 

const userSchema = new Schema({

  firstName: {
    type: String,
    required: [true, "first name is required"]
  },

  lastName: {
    type: String
  },

  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },

  profileImageUrl: {
    type: String
  },

  role: {
    type: String,
    enum: ["AUTHOR", "USER", "ADMIN"],
    required: [true, "role is required"]
  },

  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "password must contain at least 6 characters"]
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  strict: "throw",
  versionKey: false
});

//safe export (prevents OverwriteModelError)
export default mongoose.models.User || mongoose.model("User", userSchema);