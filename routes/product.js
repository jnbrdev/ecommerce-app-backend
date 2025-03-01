// routes/product.js
const express = require("express");
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");
const upload = require("../middleware/multer"); // import multer middleware

const router = express.Router();
router.post("/", verify, verifyAdmin, upload.single('image'), productController.createProduct); // Add `upload.single('image')` to handle file upload

// Other routes
router.get("/all", verify, verifyAdmin, productController.getAllProducts);
router.get("/active", productController.getAllActiveProducts);
router.get("/:productId", productController.getProduct);
router.patch("/:productId/update", verify, verifyAdmin, upload.single('image'), productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);
router.post("/search-by-name", productController.searchProductsByName);
router.post("/search-by-price", productController.searchProductsByPrice);

module.exports = router;
