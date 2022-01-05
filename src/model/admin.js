require('dotenv').config()
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const adminSchema = new mongoose.Schema({
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
adminSchema.methods.toJSON = function () {
    const admin = this

    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens
    delete adminObject.avater

    return adminObject
}


//Function to hash password
adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    next()
})


//Function for login credentials
adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login!')
    }

    return admin
}


//Function to generate authentication token
adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.ADMIN_JWT_SECRET, { expiresIn: '3 days' })
    
    admin.tokens = await admin.tokens.concat({ token })
    await admin.save()

    return token
}


const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin