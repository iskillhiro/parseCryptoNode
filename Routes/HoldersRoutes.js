const express = require('express')
const { parseHolders } = require('../ParseUtils/ParseHolders')
const parseRoutes = express.Router()

parseRoutes.get('/', parseHolders)

module.exports = parseRoutes
