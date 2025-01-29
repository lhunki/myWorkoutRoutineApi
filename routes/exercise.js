const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");
const { Exercise } = db;

router.get("/", async (req, res, next) => {
  try {
    const exercise = await Exercise.findAll({
      where: { userId: req.query.userId },
    });
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const name = req.body.name;
    const exercise = await Exercise.findOrCreate({
      where: {
        [Op.and]: [{ userId }, { name }],
      },
      defaults: {
        name: name,
        userId: userId,
        description: req.body.description,
        target_muscle: req.body.target_muscle,
      },
    });
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const newInfo = req.body;
    const exercise = await Exercise.findOne({
      where: {
        [Op.and]: [{ userId }, { name: newInfo.name }],
      },
    });
    if (exercise) {
      Object.keys(newInfo).forEach((prop) => {
        exercise[prop] = newInfo[prop];
      });
      await exercise.save();
    }
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
