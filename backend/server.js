// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./models"); // the file above
const { createAdminUser } = require("./utils/createAdminUser");
const dbInit = require("./utils/databaseInit");
const scheduledTasks = require("./utils/scheduledTasks");

const app = express();
app.use(
  cors({
    origin: "https://nancy-milad376.github.io", // your frontend origin
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount your routes
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(buildPath));
  app.get("*", (_, res) => res.sendFile(path.join(buildPath, "index.html")));
}

// Error handler
app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // 1) Authenticate
    await db.sequelize.authenticate();
    console.log("✔️ Database connected");

    // 2) Temporarily disable FK checks
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    console.log("🔒 Foreign key checks disabled");

    // 3) Drop all tables in the correct order
    await db.sequelize.drop();
    console.log("🗑️ All tables dropped");

    // 4) Re-enable FK checks
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🔓 Foreign key checks re-enabled");

    // 5) Sync models (recreate tables)
    await db.sequelize.sync({ alter: true });
    console.log("✅ Database re-synced (all tables recreated)");

    // 6) Seed your admin user
    await createAdminUser();

    // 7) Initialize any other data & start scheduled tasks
    await dbInit.initializeDatabase(db.sequelize);
    scheduledTasks.start();

    // 8) Start server
    app.listen(PORT, () =>
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
})();
