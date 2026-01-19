'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PLC_action_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bomb_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bombs_PLC',
          key: 'id',
        },
      },
      action_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bombs_PLC_actions',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PLC_action_logs');
  },
};
