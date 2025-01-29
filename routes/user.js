var express = require('express');
var router = express.Router();

const db = require('../models');
const { User } = db;

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newUser = await User.build(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
