const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

var express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
var router = express.Router();

const db = require("../models");
const { User } = db;

const SECRET_KEY_PATH = path.join(__dirname, "../config/jwt_secret.key");
const SECRET_KEY = fs.readFileSync(SECRET_KEY_PATH, "utf-8").trim();

// GitHub OAuth
const githubConfig = require('../config/github_auth.json');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access denied" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token not provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token invalid or expired" });
  }
};

router.post("/auth/login", async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({where: {loginId}});
    if (!user) {
      return res.status(400).json({message: "User not exists."});
    }

    // Check password
    console.log(password, user.password, user.id, user.userName);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: "Wrong password."});
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "6h",
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login_github", async (req, res, next) => {
  const { authCode } = req.body;
  if (!authCode) {
    return res.status(400).send("Authorization code is required");
  }
  try {
    // Get access token from github API
    const tokenResponse = await axios.post(githubConfig.GITHUB_TOKEN_URL, null, {
      params: {
        client_id: githubConfig.CLIENT_ID,
        client_secret: githubConfig.CLIENT_SECRET,
        code: authCode,
      },
      headers: {
        Accept: "application/json",
      },
    });
    const accessToken = tokenResponse.data.access_token;

    // Get user data from github API
    const userResponse = await axios.get(githubConfig.GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Find or create user data
    console.log(userResponse.data);
    const user = await User.findOrCreate({
      where: {loginId: `github.${userResponse.data.login}`},
      defaults: {
        loginId: `github.${userResponse.data.login}`,
        userName: userResponse.data.name,
        email: userResponse.data.email,
      }
    });

    // Send jwt token as response
    const token = jwt.sign({ userId: user[0].id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/register", async (req, res, next) => {
  try {
    const { loginId, password, userName, email } = req.body;

    const existingUser = await User.findOne({where: {loginId}});
    if (existingUser) {
      return res.status(400).json({message: "Id is already in use."})
    }

    const newUser = await User.create({
      loginId,
      password,
      userName,
      email,
    });
    res.json({success: true, user: newUser});
  } catch (error) {
    next(error);
  }
});

router.use("/", authenticateToken);

module.exports = router;
