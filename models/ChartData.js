'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class ChartData extends Model {
        static associate(models) {
            this.belongsTo(models.InfluxVar, {
                foreignKey: 'source_id',
                as: 'InfluxVars',
            })
        }
    }
    ChartData.init(
        {
            chart_id: DataTypes.INTEGER,
            key: DataTypes.STRING(255),
            value: DataTypes.TEXT,
            label: DataTypes.STRING(255),
            source_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'ChartData',
        }
    )
    return ChartData
}
