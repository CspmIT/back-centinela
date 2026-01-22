'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bombs_PLC', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },

      IP_PLC: {
        type: Sequelize.STRING(45), 
        allowNull: false
      },

      rack: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      slot: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      DB_ID: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      variable: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bombs_PLC');
  }
};
