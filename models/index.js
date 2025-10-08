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

//funcion para crear una nueva conexion a la base de datos con un schema especifico
const createDbForSchema = (schemaName) => {
    const sequelize = new Sequelize(schemaName, config.username, config.password, config)
    const newDb = {}
  
    fs.readdirSync(__dirname)
      .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
      .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
        newDb[model.name] = model
      })
  
    Object.keys(newDb).forEach(modelName => {
      if (newDb[modelName].associate) {
        newDb[modelName].associate(newDb)
      }
    })
  
    newDb.sequelize = sequelize
    newDb.Sequelize = Sequelize
    return newDb
  }

module.exports = { db, changeSchema, createDbForSchema }
