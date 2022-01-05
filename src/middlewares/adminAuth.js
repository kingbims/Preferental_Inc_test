require('dotenv').config()
const jwt = require('jsonwebtoken')
const Admin = require('../model/admin')


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
        const admin = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if (!admin) {
            throw new Error()
        }

        req.token = token
        req.admin = admin
        req.decoded = decoded
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}


module.exports = auth