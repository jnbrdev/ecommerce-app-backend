const express = require("express");
const cartController = require("../controllers/cart");
const { verify}  = require("../auth")
const router = express.Router();

router.post("/add-to-cart", verify, cartController.addItemsToCart);
router.get("/get-cart", verify, cartController.getCart);
router.patch("/update-cart-quantity", verify, cartController.updateProduct);
router.patch("/:productId/remove-from-cart", verify, cartController.removeFromCart);
router.put("/clear-cart", verify, cartController.clearCartItems);

module.exports = router;
