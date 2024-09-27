const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const headers = {
	Authorization: `Bearer ${process.env.API_KEY}`,
	'Content-Type': 'application/json',
}

async function getWalletInfo(req, res) {
	const hash = req.params.hash
	const urlTransfers = `https://api.solana.fm/v0/accounts/${hash}/transfers?page=1`
	const urlTokens = `https://api.solana.fm/v1/addresses/${hash}/tokens`
	const urlBalance = `https://api.solana.fm/v0/accounts`

	try {
		const [transfersResponse, tokensResponse, balanceResponse] =
			await Promise.all([
				axios.get(urlTransfers, { headers: headers }),
				axios.get(urlTokens, { headers: headers }),
				axios.post(
					urlBalance,
					{
						accountHashes: [hash],
						fields: ['*'],
					},
					{ headers: headers }
				),
			])

		const totalTransactions = transfersResponse.data.results || []
		const totalTokens = Object.values(tokensResponse.data.tokens) || []

		let balance = 0
		if (
			balanceResponse.data &&
			balanceResponse.data[0] &&
			balanceResponse.data[0].onchain
		) {
			balance = balanceResponse.data[0].onchain.lamports / 1e9
		} else {
			console.error(
				'Balance or onchain data is missing in the response:',
				balanceResponse.data
			)
		}

		return res.status(200).json({ totalTransactions, totalTokens, balance })
	} catch (error) {
		console.error(
			`Ошибка при получении информации: ${
				error.response?.data?.message || error.message
			} ${error.response?.status || ''}`
		)
		return res.status(500).json({ error: 'Server error' })
	}
}

module.exports = {
	getWalletInfo,
}
