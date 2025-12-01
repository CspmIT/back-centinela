'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VarsBinaryCompressedData extends Model {
    static associate(models) {
      // Relación 1:N con InfluxVars
      this.belongsTo(models.InfluxVar, { foreignKey: 'id_var', as: 'variable' })
      this.hasMany(models.VarsBinaryCompressedData, { foreignKey: 'id_var', as: 'bits' })

    }
  }

  VarsBinaryCompressedData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_var: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'InfluxVars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      bit: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'VarsBinaryCompressedData',
      indexes: [
        {
          unique: true,
          fields: ['id_var', 'bit'],
          name: 'unique_var_bit'
        }
      ]
    }
  );

  return VarsBinaryCompressedData;
};
