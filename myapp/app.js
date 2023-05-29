import express from 'express'
import bodyparser from 'body-parser'
import {router as routes}from './routes/auth_router.js'
const app=express()
const port = process.env.PORT || 5000
app.use(express.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use('/www.tcs.com',routes)

//define error handling
app.use((error, req, res, next) => { 
    if (error.name === 'JsonWebTokenError') {
            error.status = 401;
    }
    res.status(error.status || 400)
    res.json({ 
        status:error.status || 400,
        error: error.message});
  });
app.listen(port, (err) => {
    if (err) {
        console.log("Server is not connected!!!.....")
    }
    else {
        console.log("Server running at http://127.0.0.1:" + port + "/")
    }
})