'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Alarms extends Model {
        static associate(models) {
            // Relación con la variable principal
            this.belongsTo(models.InfluxVar, { foreignKey: 'id_influxvars', as: 'variable' })
            // Relación opcional con variable secundaria
            this.belongsTo(models.InfluxVar, { foreignKey: 'secondaryVariableId', as: 'secondaryVariable' })
        }
    }

    Alarms.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            id_influxvars: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            condition: {
                type: DataTypes.ENUM('>', '<', '=', '>=', '<=', 'entre'),
                allowNull: false
            },
            value: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            value2: {
                type: DataTypes.FLOAT,
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            repeatInterval: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            type: {
                type: DataTypes.ENUM('single', 'combined'),
                allowNull: false,
                defaultValue: 'single'
            },
            logicOperator: {
                type: DataTypes.ENUM('AND', 'OR'),
                allowNull: true
            },
            secondaryVariableId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            secondaryCondition: {
                type: DataTypes.ENUM('>', '<', '=', '>=', '<='),
                allowNull: true
            },
            secondaryValue: {
                type: DataTypes.FLOAT,
                allowNull: true
            },
            hasTimeRange: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            startime: {
                type: DataTypes.STRING(5), 
                allowNull: true,
                validate: {
                    is: /^([01]\d|2[0-3]):([0-5]\d)$/,
                },
            },
            endtime: {
                type: DataTypes.STRING(5), 
                allowNull: true,
                validate: {
                    is: /^([01]\d|2[0-3]):([0-5]\d)$/,
                },
            },
        },
        {
            sequelize,
            modelName: 'Alarms',
            timestamps: true
        }
    )

    return Alarms
}
