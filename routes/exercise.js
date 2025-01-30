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
    if (!exercise[1]) {
      exercise[0].update({
        description: req.body.description,
        target_muscle: req.body.target_muscle,
      });
    }
    res.json(exercise[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
