const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'savoy_hotel',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./userModel')(sequelize, Sequelize.DataTypes);
db.Room = require('./roomModel')(sequelize, Sequelize.DataTypes);
db.Booking = require('./bookingModel')(sequelize, Sequelize.DataTypes);
db.Review = require('./reviewModel')(sequelize, Sequelize.DataTypes);
db.Contact = require('./contactModel')(sequelize, Sequelize.DataTypes);
db.RoomInventory = require('./roomInventoryModel')(sequelize, Sequelize.DataTypes);
db.RoomAvailability = require('./roomAvailabilityModel')(sequelize, Sequelize.DataTypes);

// Define relationships
db.User.hasMany(db.Booking);
db.Booking.belongsTo(db.User);

db.Room.hasMany(db.Booking);
db.Booking.belongsTo(db.Room);

db.User.hasMany(db.Review);
db.Review.belongsTo(db.User);

db.Room.hasMany(db.Review);
db.Review.belongsTo(db.Room);

module.exports = db;