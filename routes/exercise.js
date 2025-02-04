const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");
const { Exercise, Workout } = db;

router.get("/personal_record", async (req, res, next) => {
  try {
    if (!req.query.id) {
      res.json({message: "exercise id is neccessary"})
    }
    let maxRep = 1;
    if (req.query.rep) {
      maxRep = req.query.rep;
    }
    const exercise = await Exercise.findOne({
      where: { userId: req.userId, id:req.query.id},
      include: Workout
    });
    let maxWeight = 0;
    exercise.Workouts.forEach(workout => {
      if (workout.Workout_Exercise.reps >= maxRep) {
        maxWeight = Math.max(maxWeight, workout.Workout_Exercise.weight);
      }
    })
    res.json({maxWeight});
  } catch (error) {
    next(error);
  }
});

router.get("/listAll", async (req, res, next) => {
  try {
    const exercises = await Exercise.findAll({
      where: { userId: req.userId },
    });
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.userId;
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
