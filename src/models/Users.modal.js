const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Hasher = require("../helpers/Hasher.helper");
const mongoosePaginate = require("mongoose-paginate-v2");

const {
  JWT_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRY,
  JWT_EMAIL_VERIFY_SECRET,
} = process.env;

const Schema = new mongoose.Schema(
  {
    profilePicture: {
      url: {
        type: String,
      },
      urlId: {
        type: String,
      },
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    password: {
      type: String,
    },
    //   otp: {
    //     email: {
    //       type: String,
    //     },
    //     phone: {
    //       type: String,
    //     },
    //   },
  },
  {
    timestamps: true,
  }
);

Schema.plugin(mongoosePaginate);

Schema.pre("save", async function (next) {
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  const salt = await Hasher.getSalt(10);

  // hash the password using our new salt
  const hash = await Hasher.hash(user.password, salt);

  // override the cleartext password with the hashed one
  user.password = hash;
  next();
});

Schema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    Hasher.compare(candidatePassword, this.password)
      .then((isMatch) => resolve(isMatch))
      .catch((err) => reject(err));
  });
};

Schema.methods.generateToken = (data) => {
  return jwt.sign(
    { ...data },
    JWT_SECRET
    // JWT_EXPIRY
  );
};
Schema.methods.generateVerifyEmailToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    JWT_EMAIL_VERIFY_SECRET || "abcd"
  );
};

exports.User = mongoose.model("User", Schema);
