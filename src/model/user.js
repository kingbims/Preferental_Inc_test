require('dotenv').config()
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please enter a valid email!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validator(value) {
            if (value.toLowercase().includes('password')) {
                throw new Error("Password cannot contain 'password'!")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


//Function to hide important details
userSchema.methods.toJSON = function () {
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avater

    return userObject
}


//Function to hash password
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


//Function for login credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}


//Function to generate authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.USER_JWT_SECRET, { expiresIn: '3 days' })
    
    user.tokens = await user.tokens.concat({ token })
    await user.save()

    return token
}


const User = mongoose.model('User', userSchema)

module.exports = User