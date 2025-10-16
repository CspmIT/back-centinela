'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Alarms', 'type', {
      type: Sequelize.ENUM('single', 'combined'),
      defaultValue: 'single',
      allowNull: false
    })
    await queryInterface.addColumn('Alarms', 'logicOperator', {
      type: Sequelize.ENUM('AND', 'OR'),
      allowNull: true
    })
    await queryInterface.addColumn('Alarms', 'secondaryVariableId', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('Alarms', 'secondaryCondition', {
      type: Sequelize.STRING,
      allowNull: true
    })
    await queryInterface.addColumn('Alarms', 'secondaryValue', {
      type: Sequelize.FLOAT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Alarms', 'type')
    await queryInterface.removeColumn('Alarms', 'condition')
    await queryInterface.removeColumn('Alarms', 'secondaryVariableId')
    await queryInterface.removeColumn('Alarms', 'secondaryCondition')
    await queryInterface.removeColumn('Alarms', 'secondaryValue')
  }
}