// models/index.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load models
db.user = require("./userModel")(sequelize, Sequelize.DataTypes);
db.room = require("./roomModel")(sequelize, Sequelize.DataTypes);
db.booking = require("./bookingModel")(sequelize, Sequelize.DataTypes);
db.review = require("./reviewModel")(sequelize, Sequelize.DataTypes);
db.contact = require("./contactModel")(sequelize, Sequelize.DataTypes);
db.roominventory = require("./roomInventoryModel")(
  sequelize,
  Sequelize.DataTypes
);
db.roomavailability = require("./roomAvailabilityModel")(
  sequelize,
  Sequelize.DataTypes
);

// Define relationships
db.user.hasMany(db.booking);
db.booking.belongsTo(db.user);

db.room.hasMany(db.booking);
db.booking.belongsTo(db.room);

db.user.hasMany(db.review);
db.review.belongsTo(db.user);

db.room.hasMany(db.review);
db.review.belongsTo(db.room);

module.exports = db;
