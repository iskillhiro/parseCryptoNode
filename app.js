const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const HoldersRoutes = require('./Routes/HoldersRoutes.js')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', HoldersRoutes)
const port = process.env.PORT || 5000

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
