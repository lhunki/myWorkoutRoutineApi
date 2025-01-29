var express = require('express');
var router = express.Router();

const db = require('../models');
const { Routine, Exercise } = db;

router.get('/:workoutId', async (req, res, next) => {
  try {
    const routine = await Routine.findAll( {where: { workoutId: req.params.workoutId }});
    res.json(routine);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newRoutine = Routine.build(req.body);
    await newRoutine.save();
    res.json(newRoutine);
  } catch (error) {
    next(error);
  }
});

router.post('/add_exercise/:routineId', async (req, res, next) => {
  try {
    const routine = await Routine.findByPk(req.params.routineId);
    if (routine) {
      const newExercise = await Exercise.create({
        name: req.body.name,
        description: req.body.description,
        muscleGroup: req.body.muscleGroup
      });
      await routine.addExercise(newExercise, { through: { set: req.body.set, reps: req.body.reps, weight: req.body.weight } });
      res.json(routine);
    } else {
      res.status(404).send('Routine not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;