# E-commerce API

## Overview

This API is built using Express.js and Node.js, designed to handle user authentication, product management, order processing, and cart functionality. Authentication is implemented using JSON Web Token (JWT) to secure endpoints, ensuring that only authorized users can access protected resources. The API provides features for user registration, login, product creation, order checkout, and cart management, making it suitable for an e-commerce platform. The database used for storing data is MongoDB.

Host: Render

## Authentication Legend

- **Yes**: Requires authentication via token.
- **Yes (Admin)**: Requires authentication via token and admin privileges.
- **No**: Publicly accessible.

---

## User Endpoints

| Method | Endpoint            | Description                                           | Authentication |
| ------ | ------------------- | ----------------------------------------------------- | -------------- |
| POST   | `/register`         | Registers a new user.                                 | No             |
| POST   | `/login`            | Logs in a user and returns a token.                   | No             |
| GET    | `/details`          | Retrieves the authenticated user's details.           | Yes            |
| PATCH  | `/:id/set-as-admin` | Sets a user as an admin.                              | Yes (Admin)    |
| PATCH  | `/update-password`  | Updates the authenticated user's password.            | Yes            |
| PATCH  | `/update-profile`   | Updates the authenticated user's profile information. | Yes            |
| GET    | `/all-users`        | Retrieves all users (Admin only).                     | Yes (Admin)    |

---

## Product Endpoints

| Method | Endpoint               | Description                                 | Authentication |
| ------ | ---------------------- | ------------------------------------------- | -------------- |
| POST   | `/`                    | Creates a new product with an image upload. | Yes (Admin)    |
| GET    | `/all`                 | Retrieves all products (Admin only).        | Yes (Admin)    |
| GET    | `/active`              | Retrieves all active products.              | No             |
| GET    | `/:productId`          | Retrieves details of a specific product.    | No             |
| PATCH  | `/:productId/update`   | Updates a product with an image upload.     | Yes (Admin)    |
| PATCH  | `/:productId/archive`  | Archives a product (marks as inactive).     | Yes (Admin)    |
| PATCH  | `/:productId/activate` | Activates a previously archived product.    | Yes (Admin)    |
| POST   | `/search-by-name`      | Searches for products by name.              | No             |
| POST   | `/search-by-price`     | Searches for products by price range.       | No             |

---

## Order Endpoints

| Method | Endpoint           | Description                                    | Authentication |
| ------ | ------------------ | ---------------------------------------------- | -------------- |
| POST   | `/checkout`        | Creates an order for the authenticated user.   | Yes            |
| POST   | `/order-xendit`    | Creates an order using Xendit payment gateway. | Yes            |
| POST   | `/xendit-callback` | Handles Xendit payment callbacks.              | No             |
| GET    | `/my-orders`       | Retrieves the authenticated user's orders.     | Yes            |
| GET    | `/all-orders`      | Retrieves all orders (Admin only).             | Yes (Admin)    |

---

## Cart Endpoints

| Method | Endpoint                       | Description                                    | Authentication |
| ------ | ------------------------------ | ---------------------------------------------- | -------------- |
| POST   | `/add-to-cart`                 | Adds an item to the authenticated user's cart. | Yes            |
| GET    | `/get-cart`                    | Retrieves the authenticated user's cart.       | Yes            |
| PATCH  | `/update-cart-quantity`        | Updates the quantity of a cart item.           | Yes            |
| PATCH  | `/:productId/remove-from-cart` | Removes a specific item from the cart.         | Yes            |
| PUT    | `/clear-cart`                  | Clears all items from the cart.                | Yes            |

---


