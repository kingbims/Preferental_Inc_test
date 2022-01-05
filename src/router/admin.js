const express = require('express')
const Admin = require('../model/admin')
const User = require('../model/user')
const router = new express.Router()
const auth1 = require('../middlewares/adminAuth')


//Create admin profile
router.post('/admins', async (req, res) => {
    const admin = await new Admin(req.body)
    try {
        await admin.save()
        res.send(admin)
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Login admin
router.post('/admins/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Logout admin
router.post('/admins/logout', auth1, async ( req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token === !req.token
        })

        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).send({ e: e.message })
    }
})


//Read admin profile
router.get('/admins/me', auth1, async (req, res) => {
    res.send(req.admin)
})


//Admin read all users profile
router.get('/users', auth1, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send({ e: e.message })
    }
})


//Update admin profile
router.patch('/admins/me', auth1, async (req, res) => {
    try {
        await req.admin.updateOne(req.body, { new: true, runValidadors: true })
        await req.admin.save()
        res.send(req.admin)
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Admin delete user profile
router.delete('/users/:id', auth1, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }
        res.send('Deleted successfully')
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Delete admin profile
router.delete('/admins/me', auth1, async (req, res) => {
    try {
        await req.admin.remove()
        res.send('Deleted successfully')
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router