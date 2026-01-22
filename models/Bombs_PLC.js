'use strict';

module.exports = (sequelize, DataTypes) => {
  const Bombs_PLC = sequelize.define(
    'Bombs_PLC',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },

      IP_PLC: {
        type: DataTypes.STRING(45),
        allowNull: false
      },

      rack: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      slot: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      DB_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      variable: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'Bombs_PLC',
      timestamps: true,
      underscored: false
    }
  );

  /**
   * Asociaciones
   */
  Bombs_PLC.associate = (models) => {
    Bombs_PLC.hasMany(models.Bombs_PLC_actions, {
      foreignKey: 'id_bombs_PLC',
      as: 'actions'
    });
  };

  return Bombs_PLC;
};
