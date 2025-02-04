const fs = require("fs");
const path = require("path");

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

router.post("/login", async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.and]: [{ loginId }, { password }],
      },
    });
    if (!user) {
      res.status(401).json({ message: "Invalid id or password" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/login_github", async (req, res, next) => {
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

router.post("/sign_up", async (req, res, next) => {
  try {
    const { id, userName, password, email } = req.body;
    const newUser = await User.create({
      loginId: id,
      userName,
      password,
      email,
    });
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

router.use("/", authenticateToken);

router.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newUser = await User.build(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
