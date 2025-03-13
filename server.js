const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to add user data to requests
app.use(async (req, res, next) => {
    try {
        const user = await User.findOne({
            username: "transon",
        });
        if (user) {
            req.user = user;
        } else {
            const user = new User({
                username: "transon",
                email: "son@gmail.com",
                cart: {
                    items: [],
                },
            });
            await user.save();
            req.user = user;
        }
        next();
    } catch (error) {
        console.log(error);
    }
    // next();
});

app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);
app.use(errorController.get404);

mongoose
    .connect(
        "mongodb+srv://transon15042003:P0ODb9bgG86W8Gm5@cluster0.usy9d.mongodb.net/shop"
    )
    .then((result) => {
        app.listen(3000);
    })
    .catch((error) => {
        console.log(error);
    });
