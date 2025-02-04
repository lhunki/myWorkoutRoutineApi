express = require("express");
router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");
const { Workout, Exercise } = db;

router.get("/listAll", async (req, res, next) => {
  try {
    const workouts = await Workout.findAll({
      where: { userId: req.userId },
    });
    res.json(workouts);
  } catch (error) {
    next(error);
  }
});

router.get("/date", async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const userId = req.userId;
    const workouts = await Workout.findAll({
      where: {
        [Op.and]: [
          { userId },
          { date: { [Op.between]: [startDate, endDate] } },
        ],
      },
      include: Exercise,
    });
    res.json(workouts);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const newWorkout = Workout.build(req.body);
    await newWorkout.save();
    res.json(newWorkout);
  } catch (error) {
    next(error);
  }
});

router.post("/add_exercise", async (req, res, next) => {
  try {
    const userId = req.userId;
    const workoutId = req.query.workoutId;
    const workout = await Workout.findByPk(workoutId);
    if (workout) {
      const exercise = await Exercise.findOrCreate({
        where: {
          [Op.and]: [{ userId }, { name: req.body.name }],
        },
        defaults: {
          name: req.body.name,
          userId: userId,
          description: req.body.description,
          muscleGroup: req.body.muscleGroup,
        },
      });
      await workout.addExercise(exercise[0], {
        through: {
          sets: req.body.sets,
          reps: req.body.reps,
          weight: req.body.weight,
        },
      });
      res.json(workout);
    } else {
      res.status(404).send("Workout not found");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
