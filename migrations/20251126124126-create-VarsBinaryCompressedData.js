'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('VarsBinaryCompressedData', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_var: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'InfluxVars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      bit: {
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

  async down (queryInterface) {
    await queryInterface.dropTable('VarsBinaryCompressedData');
  }
};
