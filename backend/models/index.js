// models/index.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "savoy_hotel",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 16558,
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// load models
db.User = require("./userModel")(sequelize, Sequelize.DataTypes);
db.Room = require("./roomModel")(sequelize, Sequelize.DataTypes);
db.Booking = require("./bookingModel")(sequelize, Sequelize.DataTypes);
db.Review = require("./reviewModel")(sequelize, Sequelize.DataTypes);
db.Contact = require("./contactModel")(sequelize, Sequelize.DataTypes);
db.RoomInventory = require("./roomInventoryModel")(
  sequelize,
  Sequelize.DataTypes
);
db.RoomAvailability = require("./roomAvailabilityModel")(
  sequelize,
  Sequelize.DataTypes
);

// alias lowercase keys so your controllers don't break
db.user = db.User;
db.room = db.Room;
db.booking = db.Booking;
db.review = db.Review;
db.contact = db.Contact;
db.roominventory = db.RoomInventory;
db.roomavailability = db.RoomAvailability;

// define relations
db.User.hasMany(db.Booking, {
  foreignKey: "UserId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
db.Booking.belongsTo(db.User, {
  foreignKey: "UserId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

db.Room.hasMany(db.Booking, {
  foreignKey: "RoomId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
db.Booking.belongsTo(db.Room, {
  foreignKey: "RoomId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

db.User.hasMany(db.Review, { foreignKey: "UserId", onDelete: "CASCADE" });
db.Review.belongsTo(db.User, { foreignKey: "UserId", onDelete: "CASCADE" });

db.Room.hasMany(db.Review, { foreignKey: "RoomId", onDelete: "CASCADE" });
db.Review.belongsTo(db.Room, { foreignKey: "RoomId", onDelete: "CASCADE" });

module.exports = db;
