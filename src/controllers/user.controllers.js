const HasherHelper = require("../helpers/Hasher.helper");
const HttpError = require("../helpers/HttpError.helpers");
const Response = require("../helpers/Response.helpers");
const { UserService } = require("../services/user.service");
const passport = require("passport");
require("../passport/auth");

class UserController {
  createNewUser = async (req, res) => {
    const checkUser = await UserService.findOne({ email: req.body.email });

    console.log(req.body.name);

    if (checkUser) {
      throw new HttpError(401, "User Already Exists");
    }

    const user = await UserService.create({ ...req.body });

    const { generateToken } = user.schema.methods;

    const accessToken = generateToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    const userData = {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      name: user.name,
    };

    Response(res)
      .status(201)
      .body({
        accessToken,
        user: userData,
      })
      .send();
  };
  loginViaPassword = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await UserService.findOne({ email });

    if (!user) {
      throw new HttpError(404, "User Not Found");
    }

    const { generateToken } = user.schema.methods;

    const isVerify = await HasherHelper.compare(password, user.password);
    if (!isVerify) throw new HttpError(401, "Incorrect Password");

    const accessToken = generateToken({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    const userData = {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      name: user.name,
    };
    Response(res)
      .status(201)
      .body({
        accessToken,
        user: userData,
      })
      .send();
  };
  editCurrentUser = async (req, res) => {
    if (req.body.password) {
      const salt = await HasherHelper.getSalt(10);

      const hash = await HasherHelper.hash(req.body.password, salt);

      req.body.password = hash;
    }

    const user = await UserService.findByIdAndUpdate(req.user._id, {
      ...req.body,
    });

    if (!user) throw new HttpError(409, "User doesn't Exists!");

    Response(res).status(201).message("Successfully Updated!").send();
  };
  createAdminUser = async (req, res) => {
    await UserService.create({ ...req.body, role: "Admin" });
    Response(res).status(201).message("Successfully Created").send();
  };
  getCurrentUser = async (req, res) => {
    const user = await UserService.findById(req.user._id);
    const userData = {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      _id: user._id,
    };
    Response(res).body(userData).send();
  };
  getAllUsers = async (req, res) => {
    const user = await UserService.find({
      _id: { $nin: [req.user._id] },
    }).sort({ createdAt: -1 });
    Response(res).body(user).send();
  };
  getUserDetails = async (req, res) => {
    const { userId } = req.params;
    const user = await UserService.findById(userId);
    if (!user) throw new HttpError(400, "No User Exists!");

    Response(res).body(user).send();
  };
  google = (req, res, next) => {
    console.log("Initiating Google Authentication...");
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res, next);
  };

  googleCallback = async (req, res, next) => {
    passport.authenticate(
      "google",
      { session: false },
      async (err, userinfo) => {
        if (err) {
          console.log({ err });
          return res.redirect("https://sustainable-nature.vercel.app");
        }

        console.log({ userinfo });
        const { emails, displayName } = userinfo;
        const email = emails[0].value;

        let user = await UserService.findOne({ email });

        if (!user) {
          user = await UserService.create({
            email: email,
            name: displayName,
            role: "User",
          });
        }

        const { generateToken } = user.schema.methods;

        const accessToken = generateToken({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

        return res.redirect(
          `https://sustainable-nature.vercel.app?token=${accessToken}`
        );
        // return res.redirect(`http://localhost:5173?token=${accessToken}`);
      }
    )(req, res, next);
  };
}

module.exports.UserController = new UserController();
