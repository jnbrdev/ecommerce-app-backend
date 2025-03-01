const Product = require("../models/Product");
const auth = require("../auth");


// Create a new product
module.exports.createProduct = async (req, res) => {
    if (req.user.isAdmin === false) { 
        return res.status(403).send({ auth: "Failed", message: 'Action Forbidden' });
    }
    try {
        const { name, description, price } = req.body;
        const image = req.file ? req.file.filename : null; // Only assign image if req.file exists

        const newProduct = new Product({
            name,
            description,
            price,
            image // If no image is uploaded, this field will be null
        });
        
        await newProduct.save();
        return res.status(201).send(newProduct);
    } catch (error) {
        return res.status(400).send({ message: "Error creating product", error: error.message });
    }
};
// Retrieve all products
module.exports.getAllProducts = async (req, res) => {
    if (!req.user) { 
        return res.status(403).send({ auth: "Failed", message: 'Action Forbidden' });
    }
    try {
        const products = await Product.find(); 
        return res.status(200).send(products); 
    } catch (error) {
        return res.status(400).send({ auth: "Error retrieving products", error: error.message });
    }
};

// Retrieve all active products
module.exports.getAllActiveProducts = async (req, res) => {
    try {
        const activeProducts = await Product.find({ isActive: true });
        return res.status(200).send(activeProducts); 
    } catch (error) {
        return res.status(400).send({ message: "Error retrieving active products", error: error.message });
    }
};

// Retrieve a single product by ID
module.exports.getProduct = async (req, res) => {
    const { productId } = req.params; 
    try {
        const product = await Product.findById(productId); 
        if (!product) {
            return res.status(404).send({ error: "Product not found" }); 
        }
        return res.status(200).send(product); 
    } catch (error) {
        return res.status(400).send({ message: "Error retrieving product", error: error.message });
    }
};

// Update product information
module.exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const updateData = req.body;

    try {
        // Add image file name to update data if an image is uploaded
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).send({ error: "Product not found" });
        }
        
        return res.status(200).send({ success: true, message: "Product updated successfully" });
    } catch (error) {
        return res.status(400).send({ message: "Error updating product", error: error.message });
    }
};

// Archive a product
module.exports.archiveProduct = async (req, res) => {
    const { productId } = req.params; 
    try {
        const product = await Product.findById(productId); 

        if (!product) {
            return res.status(404).send({ error: "Product not found" }); 
        }

        if (!product.isActive) {
            return res.status(200).send({ message: "Product is already archived",  archivedProduct: product}); 
        }

        await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
        return res.status(200).send({ success: true, message: "Product archived successfully" });
    } catch (error) {
        return res.status(400).send({ message: "Error archiving product", error: error.message });
    }
};

// Activate a product
module.exports.activateProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findById(productId); 
        if (!product) {
            return res.status(404).send({ error: "Product not found" }); 
        }

        if (product.isActive) {
            return res.status(200).send({ message: "Product is already active",  activateProduct: product}); 
        }

        await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true });
        return res.status(200).send({ success: true, message: "Product activated successfully" });
    } catch (error) {
        return res.status(400).send({ message: "Error activating product", error: error.message });
    }
};


// Search product by name
module.exports.searchProductsByName = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: 'Product name is required' });
        }

        const products = await Product.find({
            name: { $regex: name, $options: 'i' }
        });

        if (products.length > 0) {
            return res.status(200).send(products);
        } else {
            return res.status(404).send({ message: 'No product found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

// Search product by price
module.exports.searchProductsByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        if (minPrice == null || maxPrice == null) {
            return res.status(400).json({
                message: 'Please provide both minPrice and maxPrice.'
            });
        }

        const products = await Product.find({
            price: {
                $gte: minPrice,
                $lte: maxPrice
            },
            isActive: true 
        });

        if (products.length > 0) {
            return res.status(200).json(products);
        } else {
            return res.status(404).json({
                message: 'No active products found within the specified price range.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
