module.exports = (sequelize, DataTypes) => {
    const PLC_action_logs = sequelize.define(
      'PLC_action_logs',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        bomb_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        action_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'PLC_action_logs',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: false,
      }
    )
  
    PLC_action_logs.associate = (models) => {
      PLC_action_logs.belongsTo(models.Bombs_PLC, {
        foreignKey: 'bomb_id',
        as: 'bomb',
      })
  
      PLC_action_logs.belongsTo(models.Bombs_PLC_actions, {
        foreignKey: 'action_id',
        as: 'action',
      })
  
      PLC_action_logs.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })
    }
  
    return PLC_action_logs
  }
  