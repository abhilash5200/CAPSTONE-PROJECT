import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

import { userRouter } from "./APIS/UserAPI.js";
import { authorRouter } from "./APIS/AuthorAPI.js";
import { adminRouter } from "./APIS/AdminAPI.js";
import { commonRouter } from "./APIS/CommonAPI.js";

config(); //load .env variables

//create express app
const app = exp();

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
    console.log("db connection success");

    //start server
    app.listen(process.env.PORT, () =>
      console.log(`server started on port ${process.env.PORT}`)
    );

  } catch (err) {
    console.log("err in DB connection", err);
  }
};

connectDB();


// LOGOUT 

//dealing with invalid path


// INVALID PATH 

app.use((req, res, next) => {
  console.log(req.url)
  res.json({ message:`${req.url} is Invalid path`});
});


// ERROR HANDLER 

app.use((err, req, res, next) => {

  console.error("ERROR:", err.message);

  res.status(err.status || 500).json({
    message: "error",
    reason: err.message
  });
});
