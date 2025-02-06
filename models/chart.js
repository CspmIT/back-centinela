'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Chart extends Model {
        static associate(models) {
            // define association here
            this.hasMany(models.ChartConfig, {
                foreignKey: 'chart_id',
                as: 'ChartConfig',
            })
            this.hasMany(models.ChartData, {
                foreignKey: 'chart_id',
                as: 'ChartData',
            })
            this.hasMany(models.BombsData, {
                foreignKey: 'chartId',
                as: 'BombsData',
            })
            this.hasMany(models.ChartSeriesData, {
                foreignKey: 'chart_id',
                as: 'ChartSeriesData',
            })
        }
    }

    Chart.init(
        {
            name: DataTypes.STRING,
            type: DataTypes.STRING,
            status: DataTypes.TINYINT,
        },
        {
            sequelize,
            modelName: 'Chart',
        }
    )
    return Chart
}
