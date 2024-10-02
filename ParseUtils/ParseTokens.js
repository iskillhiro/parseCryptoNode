const axios = require('axios')

// URL RPC для Solana (Chainstack или другой провайдер)
const url =
	'https://solana-mainnet.core.chainstack.com/79e373618ff06d5118236102b2fdb077/'

// Заголовки для запросов
const headers = {
	accept: 'application/json',
	'content-type': 'application/json',
}

// Функция для получения количества токенов для каждого кошелька
async function getTokenCount(walletAddress) {
	const payload = {
		id: 1,
		jsonrpc: '2.0',
		method: 'getTokenAccountsByOwner',
		params: [
			walletAddress,
			{ programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, // Программа токенов Solana
			{ encoding: 'jsonParsed' },
		],
	}

	try {
		// Отправляем запрос
		const response = await axios.post(url, payload, { headers })

		// Проверяем ответ
		if (response.status === 200) {
			const data = response.data
			if (data.result && data.result.value) {
				const tokenAccounts = data.result.value // Список всех токен-аккаунтов

				// Фильтрация счетов с ненулевым количеством токенов
				const nonZeroAccounts = tokenAccounts.filter(
					account =>
						parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount) >
						0
				)

				// Возвращаем количество токенов с ненулевым балансом
				return nonZeroAccounts.length
			} else {
				console.log(`Не удалось получить данные для кошелька: ${walletAddress}`)
				return 0
			}
		} else {
			console.error(
				`Ошибка при выполнении запроса для кошелька ${walletAddress}: ${response.status}`
			)
			return 0
		}
	} catch (error) {
		console.error(`Ошибка при выполнении запроса: ${error.message}`)
		return 0
	}
}

module.exports = { getTokenCount }
