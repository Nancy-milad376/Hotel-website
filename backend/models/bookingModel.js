module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "booking",
    {
      checkInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      numberOfAdults: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      numberOfChildren: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      numberOfRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      specialRequests: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
        defaultValue: "pending",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "refunded"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.ENUM("credit", "payAtHotel"),
        defaultValue: "credit",
      },
    },
    { freezeTableName: true, tableName: "bookings", timestamps: true }
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
    });
    Booking.belongsTo(models.room, {
      foreignKey: "roomId",
      as: "room",
    });
  };

  return Booking;
};
