'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('InfluxVars', 'binary_compressed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, 
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('InfluxVars', 'binary_compressed');
  }
};
