const Cart = require("../models/Cart");
const Product = require("../models/Product");

module.exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        res.status(200).send({cart: cart});
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};

module.exports.addItemsToCart = async (req, res) => {
    const { productId, quantity, subtotal } = req.body;

    if (!productId || quantity === undefined || subtotal === undefined) {
        return res.status(400).send({ message: "Product ID, quantity, and subtotal are required." });
    }

    try {
        const product = await Product.findById(productId);

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                cartItems: [],
                totalPrice: 0,
            });
        }

        const existingItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        
        if (existingItemIndex >= 0) {
            cart.cartItems[existingItemIndex].quantity += quantity;
            cart.cartItems[existingItemIndex].subTotal += subtotal; 
        } else {
            cart.cartItems.push({
                productId: productId,
                quantity: quantity,
                subTotal: subtotal,
            });
        }

        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subTotal, 0);
        
        await cart.save();

        res.status(201).send({message: "Item added to cart successfully", cart: cart});
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};

// Update product quantity in the cart
module.exports.updateProduct = async (req, res) => {
    const { productId, newQuantity } = req.body;

    if (!productId || newQuantity === undefined) {
        return res.status(400).send({ message: "Product ID and new quantity are required." });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        if (itemIndex < 0) {
            return res.status(404).send({ message: "Product not found in cart." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ message: "Product not found." });
        }

        const oldQuantity = cart.cartItems[itemIndex].quantity;
        cart.cartItems[itemIndex].quantity = newQuantity;
        cart.cartItems[itemIndex].subTotal = product.price * newQuantity;

        // Update total price
        cart.totalPrice += (cart.cartItems[itemIndex].subTotal - (product.price * oldQuantity));

        await cart.save();

        res.status(200).send({message: "Item quantity updated successfully", updatedCart: cart});
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};

module.exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        if (itemIndex < 0) {
            return res.status(404).send({ message: "Item not found in cart." });
        }

        const removedItem = cart.cartItems[itemIndex];
        cart.totalPrice -= removedItem.subTotal;
        cart.cartItems.splice(itemIndex, 1);

        await cart.save();

        res.status(200).send({ message: "Item removed from cart successfully", updatedCart: cart });
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
};
module.exports.clearCartItems = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart.cartItems.length > 0) {
            cart.cartItems = [];
            cart.totalPrice = 0;

            await cart.save();

            return res.status(200).send({ message: "Cart cleared successfully", cart: cart });
        } else {
            return res.status(400).send({ error: "No items in the cart to clear." });
        }
    } catch (error) {
        return res.status(500).send({ message: "Server error", error: error.message });
    }
};

