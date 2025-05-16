const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();

// Register form
router.get("/register", (req, res) => {
  res.render("users/register");  // No leading slash
});

// Register user
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash("success", "Welcome to the app!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/register");
  }
});

// Login form
router.get("/login", (req, res) => {
  res.render("users/login"); // No leading slash
});

// Login logic
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
res.redirect(redirectUrl);

  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/listings");
  });
});

module.exports = router;
