import jwt from "jsonwebtoken";
import getConfigs from "../config/config.js";

const Configs = getConfigs();
const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    
    const verified = jwt.verify(token, Configs.jwt.accessSecret);
 
    
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default verifyToken;
