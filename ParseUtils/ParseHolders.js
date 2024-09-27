const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const url =
	'https://api.solana.fm/v1/tokens/HEMuxZtYy86LcgaRWULnWPf4KpJ1B9r9R9CANR41pump/holders'

const headers = {
	Authorization: `Bearer ${process.env.API_KEY}`,
	'Content-Type': 'application/json',
}

async function parseHolders(req, res) {
	let allHolderrs = []
	let page = 1
	let totalHolders = 0
	const totalSupply = 1_000_000_000
	let requestsCount = 0

	while (true) {
		const tokenInfo = await getTokenHolders(page)
		requestsCount++

		if (requestsCount % 10 === 0) {
			await new Promise(resolve => setTimeout(resolve, 1000))
		}

		if (tokenInfo && tokenInfo.tokenAccounts) {
			const holders = tokenInfo.tokenAccounts

			if (holders.length === 0) {
				break
			}

			totalHolders += holders.length

			holders.forEach((account, index) => {
				const owner = account.info.owner
				const amount = parseFloat(account.info.tokenAmount.uiAmount)
				const percentage = (amount / totalSupply) * 100
				if (amount > 0) {
					allHolderrs.push({ account, amount, percentage })
				}
			})

			page++
		} else {
			break
		}
	}
	if (allHolderrs.length < 1) {
		return res.status(404).json({
			message: 'Not found',
		})
	}
	sortedHolders = allHolderrs.sort((a, b) =>
		a.percentage > b.percentage ? 1 : -1
	)

	return res.status(200).json({
		totalHolders: allHolderrs.length,
		allHolders: sortedHolders,
	})
}

async function getTokenHolders(page = 1, limit = 100) {
	try {
		const response = await axios.get(url, {
			headers: headers,
			params: {
				page: page,
				limit: limit,
			},
		})

		return response.data
	} catch (error) {
		console.error(`Ошибка при получении информации: ${error.response.status}`)
		return null
	}
}

module.exports = {
	parseHolders,
}
