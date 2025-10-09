'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.DATABASE || 'masagua'
const config = require(__dirname + '/../config/config.js')[env]
const db = {}

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
)

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        )
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        )
        db[model.name] = model
    })

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.Sequelize = Sequelize
db.sequelize = sequelize

// funcion para cambiar la base de datos de forma global (db) a un schema especifico
const changeSchema = async (schemaName) => {
    const sequelize = new Sequelize(
        schemaName,
        config.username,
        config.password,
        config
    )
    fs.readdirSync(__dirname)
        .filter((file) => {
            return (
                file.indexOf('.') !== 0 &&
                file !== basename &&
                file.slice(-3) === '.js' &&
                file.indexOf('.test.js') === -1
            )
        })
        .forEach((file) => {
            const model = require(path.join(__dirname, file))(
                sequelize,
                Sequelize.DataTypes
            )
            db[model.name] = model
        })

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db)
        }
    })
    db.sequelize = sequelize
    db.Sequelize = Sequelize
}

// funcion para crear un objeto db para un schema especifico (se usa en alarmas publicas)
const createDbForSchema = (schemaName) => {
    const sequelize = new Sequelize(
        schemaName,
        config.username,
        config.password,
        config
    )

    const localDb = {}
    fs.readdirSync(__dirname)
        .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1)
        .forEach(file => {
            const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
            localDb[model.name] = model
        })

    Object.keys(localDb).forEach(modelName => {
        if (localDb[modelName].associate) {
            localDb[modelName].associate(localDb)
        }
    })

    localDb.sequelize = sequelize
    localDb.Sequelize = Sequelize
    return localDb
}


module.exports = { db, changeSchema, createDbForSchema }
