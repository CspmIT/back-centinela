'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class VarsPLC extends Model {
        static associate(models) {
            this.belongsTo(models.PLCProfile, {
                foreignKey: 'id',
                as: 'PlcProfile',
            })
        }
    }

    VarsPLC.init(
        {
            byte: DataTypes.INTEGER,
            bit: DataTypes.INTEGER,
            type: DataTypes.ENUM(
                'BOOL',
                'BYTE',
                'INT',
                'FLOAT',
                'STRING',
                'LONG',
                'DOUBLE'
            ),
            field: DataTypes.STRING,
            plcId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'VarsPLC',
            tableName: 'VarsPLC',
        }
    )

    return VarsPLC
}
