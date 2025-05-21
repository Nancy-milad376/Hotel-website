const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes (user)
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);

// Protected routes (admin only)
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
