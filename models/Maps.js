'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class Maps extends Model {
        static associate(models) {
            this.hasMany(models.MarkersMaps, {
                foreignKey: 'idMap',
                as: 'MarkersMaps',
            })
        }
    }

    Maps.init(
        {
            bearing: DataTypes.DECIMAL(19, 15),
            latitude: DataTypes.DECIMAL(19, 15),
            longitude: DataTypes.DECIMAL(19, 15),
            pitch: DataTypes.DECIMAL(19, 15),
            zoom: DataTypes.DECIMAL(19, 15),
        },
        {
            sequelize,
            modelName: 'Maps',
            tableName: 'Maps',
        }
    )
    return Maps
}
