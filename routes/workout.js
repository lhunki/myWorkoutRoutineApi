express = require("express");
router = express.Router();
const dayjs = require("dayjs");

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
    const userId = req.userId;
    const date = req.query.date;
    const workouts = await Workout.findAll({
      where: {
        [Op.and]: [
          { userId },
          {
            date: {
              [Op.between]: [
                dayjs(date).toDate(),
                dayjs(date).add(1, "day").toDate(),
              ],
            },
          },
        ],
      },
      include: Exercise,
    });
    res.json(workouts);
  } catch (error) {
    next(error);
  }
});

router.get("/monthly", async (req, res, next) => {
  try {
    const userId = req.userId;
    const { year, month } = req.query;
    const startDate = dayjs(`${year}-${month}-01`).startOf("month");
    const endDate = startDate.add(1, "month");
    monthlyWorkout = await Workout.findAll({
      where: {
        [Op.and]: [
          { userId },
          { date: { [Op.between]: [startDate.toDate(), endDate.toDate()] } },
        ],
      },
      include: Exercise,
    });
    res.json(monthlyWorkout);
  } catch (error) {
    next(error);
  }
});

router.get("/statistics", async(req, res, next)=>{
  try {
    const userId = req.userId;
    const startDate = dayjs(req.query.startDate);
    const endDate = dayjs(req.query.endDate).add(1, 'day');
    const workouts = await Workout.findAll({
      where: {
        [Op.and]: [
          { userId },
          { date: { [Op.between]: [startDate.toDate(), endDate.toDate()] } },
        ],
      },
      include: Exercise,
    });
    // Total workout count
    const workoutCount = workouts.length;
    // Exercises count
    const exerciseCount = {};
    workouts.forEach(workout => {
      workout.Exercises.forEach(exercise => {
        if (!(exercise.name in exerciseCount)) {
          exerciseCount[exercise.name] = 1;
        } else {
          exerciseCount[exercise.name] += 1;
        }
      })
    });
    console.log(exerciseCount);
    res.json({workoutCount, exerciseCount});
  } catch (error) {
    next(error);
  }
})

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

router.delete("/", async (req, res, next) => {
  try {
    const userId = req.userId;
    const id = req.query.id;
    const workout = await Workout.findOne({ where: { userId, id } });
    if (!workout) {
      res.json({message: "no workout with given ID"});
    }
    await workout.destroy();
    res.json({ message: "workout deleted" });
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
