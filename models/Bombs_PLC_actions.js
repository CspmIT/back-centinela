'use strict';

module.exports = (sequelize, DataTypes) => {
  const Bombs_PLC_actions = sequelize.define(
    'Bombs_PLC_actions',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },

      id_bombs_PLC: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Bombs_PLC',
          key: 'id'
        }
      },

      estado: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      comando: {
        type: DataTypes.STRING(20),
        allowNull: false
      }
    },
    {
      tableName: 'Bombs_PLC_actions',
      timestamps: true,
      underscored: false
    }
  );

  /**
   * Asociaciones
   */
  Bombs_PLC_actions.associate = (models) => {
    Bombs_PLC_actions.belongsTo(models.Bombs_PLC, {
      foreignKey: 'id_bombs_PLC',
      as: 'bomb'
    });
  };

  return Bombs_PLC_actions;
};
