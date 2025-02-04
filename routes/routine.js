var express = require("express");
var router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");
const { Routine, Exercise } = db;

router.get("/listAll", async (req, res, next) => {
  try {
    const routines = await Routine.findAll({
      where: { userId: req.userId },
      include: Exercise,
    });
    res.json(routines);
  } catch (error) {
    next(error);
  }
});

router.get("/id/:routineId", async (req, res, next) => {
  try {
    const routine = await Routine.findOne({
      where: { id: req.params.routineId },
      include: Exercise,
    });
    res.json(routine);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    userId = req.userId;
    const routine = await Routine.findOrCreate({
      where: {
        [Op.and]: [{ userId }, { name: req.body.name }],
      },
      defaults: {
        userId,
        name: req.body.name,
        description: req.body.description,
      },
    });
    if (!routine[1]) {
      routine[0].update({ description: req.body.description });
    }
    res.json(routine[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/add_exercise", async (req, res, next) => {
  try {
    const userId = req.userId;
    const routineId = req.query.routineId;
    const routine = await Routine.findByPk(routineId);
    if (routine) {
      const exercise = await Exercise.findOrCreate({
        where: {
          [Op.and]: [{ userId }, { name: req.body.name }],
        },
        defaults: {
          name:req.body.name,
          userId: userId,
          description: req.body.description,
        }
      });
      await routine.addExercise(exercise[0], {
        through: {
          set: req.body.set,
          reps: req.body.reps,
          weight: req.body.weight,
        },
      });
      res.json(routine);
    } else {
      res.status(404).send("Routine not found");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
