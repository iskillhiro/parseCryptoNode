const dotenv = require('dotenv')
const axios = require('axios')
const { getSolanaBalanceViaQuickNode } = require('./ParseWallets')
const { getTokenCount } = require('./ParseTokens')
dotenv.config()

const url =
	'https://api.solana.fm/v1/tokens/HEMuxZtYy86LcgaRWULnWPf4KpJ1B9r9R9CANR41pump/holders'

const headers = {
	Authorization: `Bearer ${process.env.API_KEY}`,
	'Content-Type': 'application/json',
}

async function parseHolders(req, res) {
	const allHolders = []
	const totalSupply = 1_000_000_000
	let page = 1
	let totalHolders = 0
	let requestsCount = 0

	try {
		const solana_usd = await getSolToUsdRate()
		while (true) {
			const tokenInfo = await getTokenHolders(page)
			requestsCount++

			if (requestsCount % 10 === 0) {
				await new Promise(resolve => setTimeout(resolve, 1000))
			}

			if (tokenInfo && tokenInfo.tokenAccounts.length > 0) {
				const holders = tokenInfo.tokenAccounts
				totalHolders += holders.length

				const holderPromises = holders.map(async account => {
					const owner = account.info.owner
					const amount = parseFloat(account.info.tokenAmount.uiAmount)
					const percentage = (amount / totalSupply) * 100
					const tokens = await getTokenCount(owner)
					const balance = await getSolanaBalanceViaQuickNode(owner)
					if (amount > 0 && balance > 0) {
						return {
							account,
							amount,
							percentage,
							balance,
							balance_usd: solana_usd * balance,
							tokens,
						}
					}
				})

				const resolvedHolders = await Promise.all(holderPromises)
				allHolders.push(...resolvedHolders.filter(holder => holder))

				page++
			} else {
				break
			}
		}

		if (allHolders.length < 1) {
			return res.status(404).json({ message: 'Not found' })
		}

		const sortedHolders = allHolders.sort((a, b) => b.percentage - a.percentage)

		return res.status(200).json({
			totalHolders: allHolders.length,
			allHolders: sortedHolders,
		})
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' })
	}
}

async function getTokenHolders(page = 1, limit = 100) {
	try {
		const response = await axios.get(url, {
			headers,
			params: { page, limit },
		})
		return response.data
	} catch (error) {
		console.error(`Ошибка при получении информации: ${error.message}`)
		return null
	}
}

module.exports = { parseHolders }

async function getSolToUsdRate() {
	const url =
		'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'

	try {
		const response = await axios.get(url)

		if (response.status === 200) {
			return response.data.solana.usd
		} else {
			console.error(`Error fetching SOL to USD rate: ${response.status}`)
			return null
		}
	} catch (error) {
		console.error(`Error: ${error.message}`)
		return null
	}
}
