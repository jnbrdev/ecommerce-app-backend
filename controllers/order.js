const Order = require("../models/Order");
const Cart = require("../models/Cart");

module.exports.addOrder = async (req, res) => {
    try {
        const userId = req.user.id; 

        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).send({ error: "Cart not found for the user" });
        } 
        
        if (cart.cartItems.length === 0) {
            return res.status(400).send({ error: "No Items to Checkout" });
        }

        const newOrder = new Order({
            userId,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice
        });

        await newOrder.save();
        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).send({
            message: "Ordered Successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "An error occurred while processing your order",
            error: error.message
        });
    }
};

module.exports.addOrderXendit = async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log(userId)
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).send({ error: "Cart not found for the user" });
        } 
        
        if (cart.cartItems.length === 0) {
            return res.status(400).send({ error: "No Items to Checkout" });
        }

        const newOrder = new Order({
            userId,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice
        });

        await newOrder.save();
        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        // Integrate Xendit API here to create an invoice
        const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_API_KEY).toString('base64')}`, // Adding API Key in Basic auth format
            },
            body: JSON.stringify({
                external_id: newOrder._id.toString(),  // Use order ID as external_id
                amount: newOrder.totalPrice,  // Use totalPrice as the amount
                description: `Invoice for order ${newOrder._id}`,
                success_redirect_url: `${process.env.FRONTEND_URL}/orders/success`,
                failure_redirect_url: `${process.env.FRONTEND_URL}/orders/failure`,
                currency: 'PHP',
                customer: {
                    given_names: req.user.name,
                    email: req.user.email,
                },
            }),
        });

        const xenditData = await xenditResponse.json();
        console.log(xenditData)
        res.status(200).send({
            message: "Ordered Successfully",
            invoice_url: xenditData.invoice_url,  // Return the invoice URL
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while processing your order",
            error: error.message
        });
    }
};


module.exports.callbackXendit = async (req, res) => {
    const xenditXCallbackToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    const xIncomingCallbackTokenHeader = req.header('X-CALLBACK-TOKEN');

    // Verify the callback token
    if (xIncomingCallbackTokenHeader === xenditXCallbackToken) {
        const arrRequestInput = req.body;

        console.log('Webhook data received:', arrRequestInput);

        // Check if status is PAID
        if (arrRequestInput.status === "PAID") {
            try {
                // Find the order by ID (assuming external_id is the MongoDB _id)
                const order = await Order.findById(arrRequestInput.external_id);

                if (!order) {
                    return res.status(404).json({ message: 'Order not found' });
                }

                // Update the status to 'Paid'
                order.status = 'Paid';

                // Save the updated order
                await order.save();

                console.log('Order updated successfully:', order);
                res.status(200).send('Order updated successfully');
            } catch (error) {
                console.error('Error updating order:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        } else {
            console.log('Payment status is not PAID');
            res.status(200).send('Payment status is not PAID');
        }
    } else {
        res.status(403).send('Invalid callback token');
    }
};






module.exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ userId }).sort({ orderedOn: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        // Send the found orders to the client
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Retrieve all orders for admin
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
  
        if (orders.length > 0) {
            return res.status(200).json({ orders });
        } else {
            return res.status(404).json({
                message: 'No orders found.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
  };
