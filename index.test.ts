import proxyFetch from './index.ts';
import { describe, test } from 'vitest'

describe('test', async () => {
	const response = await proxyFetch('https://quote-api.jup.ag/v6/quote');
	test("fetch request", async () => {
		await Promise.all(Array.from({ length: 400 }).fill(null).map(async (_, idx) => {
			try {
				const urlParameters = new URLSearchParams({
					inputMint: "So11111111111111111111111111111111111111112",
					outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
					amount: String(1 * 10 ** 8),
					slippage: String(1),
				});
			const response = await proxyFetch('https://quote-api.jup.ag/v6/quote?' + urlParameters);
				if (!response.ok) {
					console.log(response.error, idx)
				}
				const data = await response.json()
				console.log(data, idx)
			} catch (e) {
				console.log(e)
			}
		}))
	})
})
