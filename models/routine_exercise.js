'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Routine_Exercise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Routine_Exercise.init({
    routineId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    exerciseId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    sets: DataTypes.INTEGER,
    reps: DataTypes.INTEGER,
    weight: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Routine_Exercise',
  });
  return Routine_Exercise;
};