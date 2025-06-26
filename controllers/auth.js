import Joi from "joi";
import sanitize from "mongo-sanitize";
import getConfigs from "../config/config.js";
import { create, verify } from "../utils/authServices.js";
import UserModel from "../database/schema/user.js";

const Configs = getConfigs();

export const authSchema = Joi.object({
  username: Joi.string().min(1).max(25).trim().required(),
  email: Joi.string().email().min(5).max(50).trim().required(),
  password: Joi.string().min(6).trim().required(),
  flatCode: Joi.string().trim().optional(),
  karmaPoints: Joi.number().min(0).optional(),
  badges: Joi.array().items(Joi.string()).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
export const register = async (req, res) => {
  try {
    const sanitized = sanitize(req.body);
    const { error, value } = authSchema.validate(sanitized);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, flatCode } = value;

    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await create(password);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      flatCode,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      result: savedUser,
      status: true,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const origin = req.get("Origin");
    const sanitized = sanitize(req.body);
    const { error, value } = loginSchema.validate(sanitized);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await verify(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = user.jwtToken();
    const options = {
      expires: new Date(
        Date.now() + Configs.cookie.cookie_expire * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");

    return res.status(200).cookie("token", token, options).json({
      message: "Login successful",
      token,
      result: user,
      status: true,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      result: user,
      status: true,
    });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(401).json({ message: "Invalid token", status: false });
  }
};
