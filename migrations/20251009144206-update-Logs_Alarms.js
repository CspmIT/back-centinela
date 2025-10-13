'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Logs_Alarms', 'viewed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Logs_Alarms', 'viewed')
  }
};
