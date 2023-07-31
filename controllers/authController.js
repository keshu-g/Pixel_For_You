const User = require('../models/Users')
const jwt = require('jsonwebtoken')


const errorHandler = (error) => {
    console.log(error.message, error.code);
    // console.log(error.code);
    const error2 = { username: '', password: '' }

    // incorrect username
    if (error.message === "incorrect username") {
        error2.username = "Username not registered"
    }
    if (error.message === "incorrect password") {
        error2.password = "incorrect password"
    }
    // duplicate username solve
    if (error.code === 11000) {
        // console.log("error code includes " + error.code);
        error2.username = "Username already in use"
    }

    if (error.message.includes("user validation failed")) {
        // console.log(error.errors)
        Object.values(error.errors).forEach(({ properties }) => {
            // console.log(properties.path, properties.message);
            error2[properties.path] = properties.message
        })
    }
    return error2
}
maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'keshusecret', {
        expiresIn: maxAge

    })
};

module.exports.signup_get = (req, res) => {
    res.render('signup');
};

module.exports.login_get = (req, res) => {
    res.render('login');
};

module.exports.signup_post = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    try {
        const user = await User.create({ username, password })
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });

    } catch (error) {
        const error2 = errorHandler(error);
        res.status(400).json({ error2 });
    };
};

module.exports.login_post = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password + 'login_post called');

    try {
        const user = await User.login(username, password)
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
        console.log("login_post runed successfully")
    }
    catch (error) {
        const error2 = errorHandler(error);
        // console.log(error2);
        console.log("login_post error", error)
        res.status(400).json({ error2 });
    }
};

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt','' ,{maxAge:1});
    res.redirect('/');
};

