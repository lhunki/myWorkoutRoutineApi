const express = require('express');
const router = express.Router();

const db = require('../models');
const { Exercise } = db;

router.get('/', async (req, res, next) => {
  try {
    const exercise = await Exercise.findAll();
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

module.exports = router;