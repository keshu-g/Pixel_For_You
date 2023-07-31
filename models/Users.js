const mongoose = require('mongoose')
const { isAlphanumeric } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter a Username'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters'],
        // validate: [validator ,'Please enter a valid username'],
        validate: [isAlphanumeric, 'Username should only be alphanumeric']
    },
    password: {
        type: String,
        required: [true, 'Please enter a Password'],
        minlength: [5, 'Password must be at least 5 characters']
    },
    uploads: {
        type: Array
    }

});

// fire a function before saving the new user data
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login the user

userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username });
    console.log("login function called");

    if (!user) {
        console.log('User not found');
        throw Error('incorrect username')
    }

    const auth = await bcrypt.compare(password, user.password)

    if (!auth) {
        console.log('incorrect password');
        throw Error('incorrect password')
    }

    console.log("login function runned successfully");
    return user

}

const User = mongoose.model('user', userSchema);

module.exports = User;