'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class PointsPLC extends Model {
        static associate(models) {
            this.belongsTo(models.PLCProfile, {
                foreignKey: 'id',
                as: 'PlcProfile',
            })
        }
    }

    PointsPLC.init(
        {
            startPoint: DataTypes.INTEGER,
            endPoint: DataTypes.INTEGER,
            plcId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'PointsPLC',
            tableName: 'PointsPLC',
        }
    )
    return PointsPLC
}
