const express = require("express");
const orderController = require("../controllers/order");
const { verify, verifyAdmin }  = require("../auth")
const router = express.Router();

router.post("/checkout", verify, orderController.addOrder);
router.post("/order-xendit", verify, orderController.addOrderXendit);
router.post("/xendit-callback", orderController.callbackXendit);
router.get("/my-orders", verify, orderController.getMyOrders);
//router.get("/all-orders", verify , verifyAdmin , orderController.getAllOrders);
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
