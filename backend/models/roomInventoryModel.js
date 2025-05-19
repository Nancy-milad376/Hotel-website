module.exports = (sequelize, DataTypes) => {
  const RoomInventory = sequelize.define('RoomInventory', {
    roomType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    totalRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    availableRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    }
  });

  return RoomInventory;
};
