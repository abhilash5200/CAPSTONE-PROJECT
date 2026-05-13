import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

import { userRouter } from "./APIS/UserAPI.js";
import { authorRouter } from "./APIS/AuthorAPI.js";
import { adminRouter } from "./APIS/AdminAPI.js";
import { commonRouter } from "./APIS/CommonAPI.js";

import cors from "cors";

config(); //load .env variables

//create express app
const app = exp();

//cors middleware
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));

//body parser middleware
app.use(exp.json());

//cookie parser middleware
app.use(cookieParser());

//connect routes
app.use("/user-api", userRouter);
app.use("/author-api", authorRouter);
app.use("/admin-api", adminRouter);
app.use("/common-api", commonRouter);


// DATABASE CONNECTION
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connection success");

    //start server
    app.listen(process.env.PORT, () =>
      console.log(`server started on port ${process.env.PORT}`)
    );

  } catch (err) {
    console.log("Err in DB connection", err);
  }
};

connectDB();


// INVALID PATH HANDLER
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `${req.url} is invalid path` });
});


// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  let message = err.message || "Unexpected error";
  let details;

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    message = "Validation error";
    details = Object.values(err.errors || {}).map((e) => e.message);
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    message = "Invalid value for field";
    details = [`${err.path} is invalid`];
  }

  // Duplicate key errors
  if (err.code === 11000) {
    message = "Duplicate value";
    const fields = Object.keys(err.keyValue || {});
    details = fields.length ? fields.map((f) => `${f} already exists`) : undefined;
  }

  // Strict mode errors
  if (err.name === "StrictModeError") {
    message = "Invalid fields provided";
    details = err.path ? [`${err.path} is not allowed`] : undefined;
  }

  // Default status fix
  const finalStatus = status === 500 && (err.name || err.code) ? 400 : status;

  const response = {
    message,
    status: finalStatus,
  };

  if (details) response.details = details;

  if (!isProduction) {
    response.stack = err.stack;
  }

  console.log("err :", err);

  res.status(finalStatus).json(response);
});