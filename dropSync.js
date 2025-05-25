// dropSync.js
const db = require("./backend/models"); // adjust path if your models folder lives elsewhere
db.sequelize
  .sync({ force: true })
  .then(() => {
    console.log("✔️ Remote tables dropped & re-synced");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to drop & re-sync:", err);
    process.exit(1);
  });
