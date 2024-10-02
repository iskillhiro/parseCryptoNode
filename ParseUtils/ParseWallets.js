const axios = require('axios')

const QUICKNODE_URL =
	'https://old-autumn-grass.solana-mainnet.quiknode.pro/56a454086ae175dd1d2b48c92c0ddb7756127eba'

async function getSolanaBalanceViaQuickNode(wallet) {
	const headers = {
		'Content-Type': 'application/json',
	}

	const payload = {
		jsonrpc: '2.0',
		id: 1,
		method: 'getBalance',
		params: [wallet],
	}

	try {
		const response = await axios.post(QUICKNODE_URL, payload, { headers })

		if (response.status === 200) {
			const lamports = response.data.result.value
			const balanceSol = lamports / 1e9

			if (balanceSol > 0) {
				return balanceSol
			}
		}
	} catch (error) {
		return 0
	}
}

module.exports = {
	getSolanaBalanceViaQuickNode,
}
