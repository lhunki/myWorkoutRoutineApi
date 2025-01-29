"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
// User ↔ Workout
db.User.hasMany(db.Workout, { foreignKey: "userId", onDelete: "CASCADE" });
db.Workout.belongsTo(db.User, { foreignKey: "userId" });

// Workout ↔ Workout_Exercises ↔ Exercise
db.Workout.belongsToMany(db.Exercise, {
  through: db.Workout_Exercise,
  foreignKey: "workoutId",
});
db.Exercise.belongsToMany(db.Workout, {
  through: db.Workout_Exercise,
  foreignKey: "exerciseId",
});

// User ↔ Routine
db.User.hasMany(db.Routine, { foreignKey: "userId", onDelete: "CASCADE" });
db.Routine.belongsTo(db.User, { foreignKey: "userId" });

// Routine ↔ Routine_Exercises ↔ Exercise
db.Routine.belongsToMany(db.Exercise, {
  through: db.Routine_Exercise,
  foreignKey: "routineId",
});
db.Exercise.belongsToMany(db.Routine, {
  through: db.Routine_Exercise,
  foreignKey: "exerciseId",
});

// User ↔ Exercises
db.User.hasMany(db.Exercise, { foreignKey: "userId", onDelete: "CASCADE" });
db.Exercise.belongsTo(db.User, { foreignKey: "userId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
