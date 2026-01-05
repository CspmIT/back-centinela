'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class ChartSeriesData extends Model {
        static associate(models) {
            this.belongsTo(models.InfluxVar, {
                foreignKey: 'source_id',
                as: 'InfluxVars',
            })
        }
    }
    ChartSeriesData.init(
        {
            chart_id: DataTypes.INTEGER,
            name: DataTypes.STRING(255),
            source_id: DataTypes.INTEGER,
            color: DataTypes.STRING(20),
            line: DataTypes.STRING(20),
            smooth: DataTypes.BOOLEAN,
            areaStyle: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: 'ChartSeriesData',
            tableName: 'ChartsSeriesData',
        }
    )
    return ChartSeriesData
}
