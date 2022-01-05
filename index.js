require('dotenv').config()
const express = require('express')
require('./src/db/mongoose')
const cors = require('cors')
const userRouter = require('./src/router/user')
const adminRouter = require('./src/router/admin')


const app = express()
const port = process.env.PORT || 3000


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(userRouter)
app.use(adminRouter)


app.listen(port, () => {
    console.log(`Server is up on ${port}...`)
})