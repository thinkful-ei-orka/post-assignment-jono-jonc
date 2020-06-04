require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(express.json())
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.get('/address', (req, res) => {
    res.send('working')
})

app.post('/address', (req, res) => {
    const { id, firstName, lastName, address1, address2, city, state, zip } = req.query
    
    if(!firstName) {
        return res
                .status(400)
                .send('First name required')
    }
    if(!lastName) {
        return res
                .status(400)
                .send('Last name required')
    }
    if(!address1) {
        return res
                .status(400)
                .send('Address is required')
    }
    if(!city) {
        return res
                .status(400)
                .send('City is required')
    }
    if(!state) {
        return res
                .status(400)
                .send('State is required')
    }
    if(!zip) {
        return res
                .status(400)
                .send('Zipcode is required')
    }
    if(zip.length !== 5 || typeof zip !== 'number') {
        return res
                .status(400)
                .send('Zipcode must be a 5 digit number')
    }
    if(state.length !== 2 || typeof state !== 'string') {
        return res
                .status(400)
                .send('State must be 2 letters')
    }
})

app.delete('/address/:id', (req, res) => {

})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app