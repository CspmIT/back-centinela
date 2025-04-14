'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class PLCProfile extends Model {
        static associate(models) {
            this.hasMany(models.PointsPLC, {
                foreignKey: 'plcId',
                as: 'PointsPLC',
            })
            this.hasMany(models.VarsPLC, {
                foreignKey: 'plcId',
                as: 'VarsPLC',
            })
        }
    }

    PLCProfile.init(
        {
            topic: DataTypes.STRING,
            influx: DataTypes.ENUM(
                'Sensors_Morteros_Interna',
                'Sensors_Externos',
                'externos'
            ),
            PLCModel: DataTypes.ENUM('LOGO_7', 'LOGO_8', 'S7_1200'),
            ip: DataTypes.STRING,
            serviceName: DataTypes.STRING,
            rack: DataTypes.INTEGER,
            slot: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'PLCProfile',
            tableName: 'PLCProfile',
        }
    )
    return PLCProfile
}
