//roomAvailabilityModel.js
module.exports = (sequelize, DataTypes) => {
  const RoomAvailability = sequelize.define(
    "roomavailability",
    {
      roomType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      bookedRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      availableRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { freezeTableName: true, tableName: "roomavailabilities" }
  );

  return RoomAvailability;
};
