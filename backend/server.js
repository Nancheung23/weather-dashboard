// installed express, nodemon, cors, body-parser
console.log("Weather Dashboard")
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = 5000
const app = express()

let COORDS = {}

app.use(cors())
app.use(bodyParser.json())

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

app.post('/api/coords', (req, res) => {
    const coords = {
        lat: req.body.lat,
        lng: req.body.lng,
    }
    COORDS = coords
    res.send(coords)
})

app.get('/api/coords', (req, res) => {
    res.json(COORDS)
})
