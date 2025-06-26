import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getConfigs from "../config/config.js";


const Configs = getConfigs();

const salt = Number(Configs.salt.salt);

const create = (password) => {
  return bcrypt.hash(password, salt);
};

const verify = (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

const generateAccessToken = (userDetails) => {
  const token = jwt.sign(userDetails, Configs.jwt.accessSecret, {
    expiresIn: Configs.jwt.accessOptions.expiresIn,
  });
  return token;
};

export { create, generateAccessToken, verify };
