'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Logs_Alarms extends Model {
    static associate(models) {
    }
  }

  Logs_Alarms.init(
    {
      message: {
        type: DataTypes.STRING,
      },
      value: {
        type: DataTypes.STRING,
      },
      viewed: {
        type: DataTypes.BOOLEAN,
      },
      triggeredAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
      },
    },
    {
      sequelize,
      modelName: 'Logs_Alarms',
      tableName: 'Logs_Alarms',
      timestamps: false,
    }
  )

  return Logs_Alarms
}
