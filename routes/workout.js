express = require("express");
router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");
const { Workout, Workout_Exercise, Exercise } = db;

router.get("/listAll", async (req, res, next) => {
  try {
    const workouts = await Workout.findAll({
      where: { userId: req.query.userId },
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
    const userId = req.query.userId;
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
    req.body.userId = req.query.userId;
    const newWorkout = Workout.build(req.body);
    await newWorkout.save();
    res.json(newWorkout);
  } catch (error) {
    next(error);
  }
});

router.post("/add_exercise/:workoutId", async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const workout = await Workout.findByPk(req.params.workoutId);
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
      await workout.addExercise(exercise, {
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
