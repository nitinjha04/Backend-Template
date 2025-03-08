const jwt = require("jsonwebtoken");
const HttpError = require("../helpers/HttpError.helpers");
const { JWT_SECRET } = process.env;

module.exports.Auth = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    throw new HttpError(401, "UnAuthorized");
  }
  const splitToken = token.split(" ")[1];
  // console.info({token})

  if (splitToken && splitToken === "null") {
    throw new HttpError(401, "UnAuthorized");
  }
  const decodedData = jwt.verify(splitToken, JWT_SECRET);
  req.user = decodedData;

  console.info("<------------Authentication--------->");
  console.info({ token, decodedData });
  console.info("<----------------End---------------->");

  next();
};
