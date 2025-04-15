const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        cart: {
            items: [
                {
                    productId: {
                        type: Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
                    },
                    quantity: { type: Number, required: true },
                },
            ],
        },
        orders: [
            {
                items: [
                    {
                        product: { type: Object, required: true },
                    },
                ],
                user: {
                    userId: {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                    },
                },
            },
        ],
    },
    {
        methods: {
            async getCart() {
                try {
                    const products = await this.populate(
                        "cart.items.productId"
                    );
                    return products.cart.items;
                } catch (error) {
                    console.log(error);
                }
            },
            async deleteProductFromCart(productId) {
                const updatedCartItems = this.cart.items.filter((item) => {
                    return item.productId.toString() !== productId.toString();
                });
                this.cart.items = updatedCartItems;
                try {
                    const result = await this.save();
                    return result;
                } catch (error) {
                    console.log(error);
                }
            },
            async createOrder() {
                try {
                    let cartProducts = await this.getCart();
                    cartProducts = cartProducts.map((p) => {
                        return {
                            product: {
                                ...p.productId._doc,
                                quantity: p.quantity,
                            },
                        };
                    });
                    console.log(cartProducts);
                    const order = {
                        items: cartProducts,
                        user: {
                            userId: this._id,
                        },
                    };
                    this.orders.push(order);
                    // console.log(this.orders);
                    this.cart.items = [];
                    const result = await this.save();
                    return result;
                } catch (error) {
                    console.log(error);
                }
            },
            getOrders() {
                try {
                    return this.orders;
                } catch (error) {
                    console.log(error);
                }
            },
        },
    }
);

userSchema.methods.addProductToCart = async function (product) {
    const updatedCartItems = [...this.cart.items];
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }

    const updatedCart = {
        items: updatedCartItems,
    };
    this.cart = updatedCart;
    try {
        const result = await this.save();
        return result;
    } catch (error) {
        console.log(error);
    }
};

module.exports = mongoose.model("User", userSchema);
