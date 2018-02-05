using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MyDashWallet.Models
{
	public static class CoinMarketCapUsdExchangeRates
	{
		public static async Task<CoinMarketCapCurrencyTicker> GetTicker()
		{
			if (cachedTicker != null && (DateTime.UtcNow - lastTimeUpdatedTicker).Minutes < 10)
				return cachedTicker;
			try
			{
				var json =
					await GetHttpResponse("https://api.coinmarketcap.com/v1/ticker/dash?convert=EUR");
				cachedTicker = JsonConvert.DeserializeObject<CoinMarketCapCurrencyTicker[]>(json)[0];
				cachedTicker.price_gbp = cachedTicker.price_eur * 0.9m;
				lastTimeUpdatedTicker = DateTime.UtcNow;
				// Also try to update GBP
				var jsonGbp =
					await GetHttpResponse("https://api.coinmarketcap.com/v1/ticker/dash?convert=GBP");
				cachedTicker.price_gbp =
					JsonConvert.DeserializeObject<CoinMarketCapCurrencyTicker[]>(jsonGbp)[0].price_gbp;
				return cachedTicker;
			}
			catch
			{
				// If service is down, just provide ruff fallback values
				return cachedTicker ??
					new CoinMarketCapCurrencyTicker { price_usd = 1000.00m, price_eur = 900.00m };
			}
		}

		private static CoinMarketCapCurrencyTicker cachedTicker;
		private static DateTime lastTimeUpdatedTicker;
		
		private static async Task<string> GetHttpResponse(string url)
			=> await (await new HttpClient(AutoDecompression).GetAsync(url)).Content.ReadAsStringAsync();

		public static HttpMessageHandler AutoDecompression
			=> new HttpClientHandler
			{
				AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
			};
	}
}