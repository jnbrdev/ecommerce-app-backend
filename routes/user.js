const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin }  = require("../auth")
const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getDetails);

router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setAdmin);

router.patch("/update-password", verify, userController.updatePassword);
router.patch("/update-profile", verify, userController.updateProfile);
router.get("/all-users", verify, verifyAdmin, userController.getAllUsers);

module.exports = router;
