const express = require('express')
const User = require('../model/user')
const router = new express.Router()
const auth = require('../middlewares/userAuth')


//Create user profile
router.post('/users', async (req, res) => {
    const user = await new User(req.body)
    try {
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Login user 
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


//Logout user
router.post('/users/logout', auth, async ( req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token === !req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send({ e: e.message })
    }
})


//Read user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


//Update user profile
router.patch('/users/me', auth, async (req, res) => {
    try {
        await req.user.updateOne(req.body, { new: true, runValidadors: true })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})


module.exports = router