'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class ChartConfig extends Model {
        static associate(models) {}
    }
    ChartConfig.init(
        {
            chart_id: DataTypes.INTEGER,
            key: DataTypes.STRING(255),
            value: DataTypes.TEXT,
            type: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'ChartConfig',
            tableName: 'ChartsConfig',
        }
    )
    return ChartConfig
}
