require("dotenv").config(); // Load .env variables first

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore=require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");

const User = require("./models/user");
const userRoutes = require("./routes/users");
const listings = require("./routes/listing");
const reviews = require("./routes/review");

const ExpressError = require("./utils/ExpressError");

const app = express();

// MongoDB Connection
const dbUrl = process.env.ATLASTDB_URL;

async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}
main()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Session config
const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET

    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log(err);
})

const sessionOptions = {
    
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
    
};


// Passport config
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRoutes);

// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Generic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
});

// Start server
app.listen(8080, () => {
    console.log("🚀 Server is running on port 8080");
});
