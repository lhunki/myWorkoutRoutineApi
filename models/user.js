'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    loginId: {type: DataTypes.STRING, unique:true},
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};