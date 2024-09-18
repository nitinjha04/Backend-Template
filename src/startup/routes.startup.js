//middlewares
const express = require("express");
const morgan = require("morgan"); // for consoling api request calls
const helmet = require("helmet"); // secures connection by adding additional header
const cors = require("cors"); // handling cors errors
const multer = require("multer");
const passport = require("passport");
var session = require("express-session");

const ErrorHandler = require("../middlewares/error.middlewares"); // error handler for routes, since we will continue to next route upon request
const { uploadOnCloudinary } = require("../utils/cloudinary");

const upload = multer({ storage: multer.memoryStorage() });

const uploadMiddleware = upload.single("file");
const { default: axios } = require("axios");

//Routers
const { UserRouter } = require("../routes/users.routes");

module.exports = (app) => {
  app.use(express.json({ limit: "9999000009mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("tiny")); // initiating console api requests
  app.use(helmet());
  app.use(cors());

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  //start of routes
  app.use("/api/users", UserRouter);
  app.post("/api/upload-image", uploadMiddleware, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const result = await uploadOnCloudinary(req.file.buffer, "sustainable");
      console.log({ result });
      res.json({
        error: false,
        message: "File uploaded successfully",
        result: { url: result.url, publicId: result.public_id },
      });
    } catch (error) {
      res.status(500).json({ message: "Error uploading file", error });
    }
  });

  // handling async errors in api routes
  app.use(ErrorHandler);

  //adding additional api
  app.get("/", (req, res) =>
    res.send({
      error: false,
      message: "Backend Server IS LIVE!",
      result: null,
    })
  );
  app.get("*", (req, res) =>
    res
      .status(404)
      .send({ error: true, message: "Route not Found!", result: null })
  );
};

console.log("🛣️  Routes setup completed");
