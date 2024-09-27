const express = require('express')
const { getWalletInfo } = require('../ParseUtils/ParseWallets')
const parseRoutes = express.Router()

parseRoutes.get('/wallet/:hash', getWalletInfo)

module.exports = parseRoutes
