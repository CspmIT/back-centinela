'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ChartsSeriesData', 'areaStyle', {
      type: Sequelize.BOOLEAN,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ChartsSeriesData', 'areaStyle');
  }
};

