'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Alarms extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.InfluxVar, { foreignKey: 'id_influxvars', as: 'variable' })
        }
    }
    Alarms.init(
        {
            name: DataTypes.STRING,
            id_influxvars: DataTypes.INTEGER,
            condition: {
                type: DataTypes.ENUM('>', '<', '=', '>=', '<=', 'entre'),
              },
            value: DataTypes.FLOAT,
            value2: DataTypes.FLOAT,
            status: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: 'Alarms',
            timestamps: true
        }
    )
    return Alarms
}
