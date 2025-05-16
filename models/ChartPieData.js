'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class ChartPieData extends Model {
        static associate(models) {
            this.belongsTo(models.InfluxVar, {
                foreignKey: 'var_id',
                as: 'InfluxVars',
            })
        }
    }
    ChartPieData.init(
        {
            chart_id: DataTypes.INTEGER,
            var_id: DataTypes.INTEGER,
            name: DataTypes.STRING(255),
            color: DataTypes.STRING(20),
        },
        {
            sequelize,
            modelName: 'ChartPieData',
            tableName: 'ChartsPieData',
        }
    )
    return ChartPieData
}
