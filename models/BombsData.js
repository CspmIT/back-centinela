'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class BombsData extends Model {
        static associate(models) {
            this.belongsTo(models.InfluxVar, {
                foreignKey: 'varId',
                as: 'InfluxVars',
            })
        }
    }

    BombsData.init(
        {
            varId: DataTypes.INTEGER,
            chartId: DataTypes.INTEGER,
            name: DataTypes.STRING,
            type: DataTypes.ENUM('pump', 'status'),
        },
        {
            sequelize,
            modelName: 'BombsData',
            tableName: 'BombsData',
        }
    )
    return BombsData
}
