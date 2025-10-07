'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Alarms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      id_influxvars: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'InfluxVars',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      condition: {
        type: Sequelize.ENUM('>', '<', '=', '>=', '<=', 'entre'),
        allowNull: false
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      value2: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Alarms');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Alarms_condition";');
  }
};
