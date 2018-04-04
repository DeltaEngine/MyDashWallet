using System;
using System.Globalization;
using System.Net;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SocialCryptoBots
{
	/// <summary>
	/// Tons of features for the Currency enum, converting from strings, checking for valid addresses,
	/// converting milli values to full values and back, and outputting dollar or euro values.
	/// All operations assume amounts and currencies in milli (mBTC, mDash)
	/// </summary>
	public static class CurrencyExtensions
	{
		public static Currency  ParseCurrency(this string symbolOrCurrency)
		{
			switch (symbolOrCurrency.ToLowerInvariant())
			{
			// Also support all kinds of fun tip currencies parsed in CurrencyAmountExtractor (all usd)
			case "cent":
			case "cents":
			case "penny":
			case "pennies":
			case "nickel":
			case "nickels":
			case "dime":
			case "dimes":
			case "quarter":
			case "quarters":
			case "cookie":
			case "cookies":
			case "beer":
			case "beers":
			case "coffee":
			case "coffees":
			case "dollar":
			case "dollars":
			case "usd":
			case "$": return Currency.USD;
			case "euros":
			case "euro":
			case "eur":
			case "€": return Currency.EUR;
			case "dash":
			case "mdash":
			case "µdash":
			case "udash":
			case "duffs":
			case "duff": return Currency.mDASH;
			case "bitcoin":
			case "btc":
			case "mbtc":
			case "sat":
			case "sats": return Currency.mBTC;
			case "ethereum":
			case "ether":
			case "eth":
			case "meth": return Currency.mETH;
			case "litecoin":
			case "lite-coin":
			case "ltc":
			case "mltc": return Currency.mLTC;
			case "bitcoincash":
			case "bitcoin-cash":
			case "bcash":
			case "b-cash":
			case "bch":
			case "mbch":
			case "bcc":
			case "mbcc": return Currency.mBCH;
			case "colx":
			case "colossuscoinxt":
			case "colossuscoin":
			case "colossus":
			case "mcolx": return Currency.COLX;
			}

			throw new NotSupportedException("Unsupported currency: " + symbolOrCurrency);
		}
		
		public static string ToCurrencyString(this Currency currency, decimal milliCoinAmount,
			string format = "#0.0####")
		{
			switch (currency)
			{
			case Currency.USD:
				return "$" + milliCoinAmount.ToString("#0.00", CultureInfo.InvariantCulture);
			case Currency.EUR:
				return milliCoinAmount.ToString("#0.00", CultureInfo.InvariantCulture) + " €";
			default:
				return milliCoinAmount.ToString(format, CultureInfo.InvariantCulture) + " " + currency;
			}
		}
		
		public static bool IsValidAddress(this Currency currency, string targetAddress,
			bool allowTestnetAddresses = false)
		{
			if (string.IsNullOrWhiteSpace(targetAddress) || targetAddress.Length < MinimumAddressLength)
				return false;
			switch (currency)
			{
			case Currency.mBTC:
				// Allow segwit and non segwit bitcoin addresses
				// https://trello.com/c/bSJxGfZo/30-segwit-addresses#comment-59c4d089bb7f659d59f6b8d6
				return targetAddress.Length <= BitcoinExampleAddress.Length || targetAddress.StartsWith("bc");
			case Currency.mDASH:
				//https://www.dash.org/forum/threads/how-do-you-recieve-dash-coins-from-a-cryptonote-dashcoin-wallet-f21c4c6.8924/
				return targetAddress.Length <= DashExampleAddress.Length &&
					(targetAddress.ToLower().StartsWith("x") ||
					allowTestnetAddresses && targetAddress.ToLower().StartsWith("y"));
			case Currency.mLTC:
				//https://www.reddit.com/r/litecoin/comments/6hze8k/question_on_litecoin_address_format_l3/
				//Fairlay does not want to support LTC segwit atm (2017-09-19):
				//https://trello.com/c/bSJxGfZo/30-segwit-addresses#comment-59c05ce26832a1e2f975de54
				return targetAddress.Length <= LitecoinExampleAddress.Length &&
					(targetAddress.ToLower().StartsWith("l") || targetAddress.ToLower().StartsWith("3") ||
					allowTestnetAddresses && (targetAddress.ToLower().StartsWith("n") ||
					targetAddress.ToLower().StartsWith("m")));
			case Currency.mETH:
				return targetAddress.Length == EtherExampleAddress.Length &&
					targetAddress.ToLower().StartsWith("0x");
			case Currency.mBCH:
				return targetAddress.Length <= BccExampleAddress.Length;
			default:
				return false;
			}
		}
		
		/// <summary>
		/// https://bitcointalk.org/index.php?topic=23937.0, mostly 33 or 34 (max) though.
		/// If the targetAddress is less than this minimum or more than the examples below, its wrong.
		/// </summary>
		private const int MinimumAddressLength = 25;
		private const string BitcoinExampleAddress = "36XUhbzeFpxykGYgsnz34GnN6A2NmbATcu";
		private const string DashExampleAddress = "XdiLEUfA6gJzU7jxKvdH8jBava7Q2J1uCe";
		private const string LitecoinExampleAddress = "LWsXTuLMFx3y52BszUYktnuBo6ymdMNLz6";
		private const string EtherExampleAddress = "0xE1BCdE463540b4D6355964fF44D4d3331EAE88aA";
		private const string BccExampleAddress = "1135t6K5QDDsYyew6sfBsHAeToC2bMk3iL";
		
		public static string GetExampleAddress(this Currency currency)
		{
			switch (currency)
			{
			case Currency.mBTC:
				return BitcoinExampleAddress;
			case Currency.mDASH:
				return DashExampleAddress;
			case Currency.mLTC:
				return LitecoinExampleAddress;
			case Currency.mETH:
				return EtherExampleAddress;
			case Currency.mBCH:
				return BccExampleAddress;
			default:
				throw new NotSupportedException("Unsupported currency: " + currency);
			}
		}
		
		/// <summary>
		/// Different queue wait times make sense for different coins as the block generation is very
		/// different, e.g. litecoin is 4 times faster (2.5minutes) than bitcoin (10 minutes),
		/// dash is 5 times faster (2 minutes), eth is superfast (10-15 seconds) and with Bitcoin Cash
		/// it is very hard to say, currently at 2-10h, will probably go to 10-20 minutes after a while.
		/// Also the more withdrawals we queue up the cheaper it gets for us fee-wise, so minimum is 3.
		/// </summary>
		public static float GetMaxQueueWaitTimeInMinutes(this Currency currency)
			=> currency == Currency.mBCH || currency == Currency.mBTC ? 10 : 3;

		/// <summary>
		/// 0.19mETH becomes 0.00019ETH, 20mDASH becomes 0.02DASH, etc.
		/// </summary>
		public static decimal ConvertFromMilliToFullCoinValue(decimal milliCoinAmount)
			=> milliCoinAmount / 1000.0m;

		public static decimal ConvertFromFullCoinToMilliValue(decimal fullCoinAmount)
			=> fullCoinAmount * 1000.0m;

		public static async Task<string> ToCurrencyStringWithDollarAndEuro(this Currency currency,
			decimal milliCoinAmount)
			=> currency.ToCurrencyString(milliCoinAmount) + " (" +
				await currency.ToDollarString(milliCoinAmount) + " = " +
				await currency.ToEuroString(milliCoinAmount) + ")";
		public static async Task<string> ToCurrencyStringWithDollarEuroAndBtc(this Currency currency,
			decimal milliCoinAmount)
			=> currency.ToCurrencyString(milliCoinAmount) + " (" +
				await currency.ToDollarEuroAndBtcString(milliCoinAmount) + ")";

		public static async Task<string>
			ToDollarEuroAndBtcString(this Currency currency, decimal milliCoinAmount)
			=> await currency.ToDollarString(milliCoinAmount) + " = " +
				await currency.ToEuroString(milliCoinAmount) + " = " +
				await currency.ToBitcoinString(milliCoinAmount);

		public static async Task<string> ToDollarString(this Currency currency, decimal milliCoinAmount)
		{
			decimal amount = currency == Currency.COLX ? milliCoinAmount
				: ConvertFromMilliToFullCoinValue(milliCoinAmount);
			var ticker = await GetTicker(currency);
			return "$" + FormattedPrice(ticker.price_usd, amount);
		}

		private static string FormattedPrice(decimal tickerPrice, decimal amount)
		{
			var price = (tickerPrice * amount).ToString("#0.00", CultureInfo.InvariantCulture);
			if (price != "0.00")
				return price;
			price = (tickerPrice * amount).ToString("#0.000", CultureInfo.InvariantCulture);
			if (price == "0.000" || price == "0.001")
				price = (tickerPrice * amount).ToString("#0.0000", CultureInfo.InvariantCulture);
			return price;
		}

		public static async Task<string> ToEuroString(this Currency currency, decimal milliCoinAmount)
		{
			decimal amount = currency == Currency.COLX ? milliCoinAmount
				: ConvertFromMilliToFullCoinValue(milliCoinAmount);
			var ticker = await GetTicker(currency);
			return FormattedPrice(ticker.price_eur, amount) + " €";
		}

		public static async Task<string> ToBitcoinString(this Currency currency, decimal milliCoinAmount)
		{
			decimal amount = currency == Currency.COLX ? milliCoinAmount
				: ConvertFromMilliToFullCoinValue(milliCoinAmount);
			var ticker = await GetTicker(currency);
			var showMBtc = ticker.price_btc * amount < 0.01m;
			if (showMBtc)
				amount = ConvertFromFullCoinToMilliValue(amount);
			var btcPrice = (ticker.price_btc * amount).ToString("#0.0####", CultureInfo.InvariantCulture);
			return btcPrice + (showMBtc ? " mBTC" : " BTC");
		}
		
		public static async Task<decimal> FiatToCoinAmount(this Currency coinCurrency, decimal fiatAmount, Currency fiatCurrency)
		{
			var ticker = await GetTicker(coinCurrency);
			decimal milliCoinAmount;
			if (fiatCurrency == Currency.USD)
				milliCoinAmount = ConvertFromFullCoinToMilliValue(fiatAmount / ticker.price_usd);
			else if (fiatCurrency == Currency.EUR)
				milliCoinAmount = ConvertFromFullCoinToMilliValue(fiatAmount / ticker.price_eur);
			else
				throw new NotSupportedException("Invaild currency = " + fiatCurrency);
			return milliCoinAmount;
		}

		public static async Task<CoinMarketCapCurrencyTicker> GetTicker(Currency currency)
		{
			if ((int)currency < lastTimeUpdatedTicker.Length &&
			    DateTime.UtcNow.AddMinutes(-1) < lastTimeUpdatedTicker[(int)currency])
				return fallbackValues[(int)currency];
			try
			{
				var json = await GetHttpResponse("https://api.coinmarketcap.com/v1/ticker/" +
					GetTickerCurrencyName(currency) + "/?convert=EUR");
				try
				{
					lastTimeUpdatedTicker[(int)currency] = DateTime.UtcNow;
					fallbackValues[(int)currency] =
						JsonConvert.DeserializeObject<CoinMarketCapCurrencyTicker[]>(json)[0];
				}
				catch
				{
					// ignored if fallback storage fails, we can still return the retried value
					return JsonConvert.DeserializeObject<CoinMarketCapCurrencyTicker[]>(json)[0];
				}
			}
			catch
			{
				// ignored
			}
			if ((int)currency < lastTimeUpdatedTicker.Length)
				return fallbackValues[(int)currency];
			return new CoinMarketCapCurrencyTicker();
		}
		
		private static string GetTickerCurrencyName(Currency currency)
		{
			switch (currency)
			{
			case Currency.mBTC:
				return "bitcoin";
			case Currency.mLTC:
				return "litecoin";
			case Currency.mETH:
				return "ethereum";
			case Currency.mBCH:
				return "bitcoin-cash";
			case Currency.mDASH:
				return "dash";
			case Currency.COLX:
				return "colossuscoinxt";
			}
			return currency.ToString();
		}

		public static string GetCurrencyLongName(Currency currency)
		{
			switch (currency)
			{
			case Currency.mBTC:
				return "Bitcoin";
			case Currency.mLTC:
				return "Litecoin";
			case Currency.mETH:
				return "Ethereum";
			case Currency.mBCH:
				return "Bitcoin Cash";
			case Currency.mDASH:
				return "Dash";
			case Currency.COLX:
				return "ColossusCoinXT";
			}
			return currency.ToString();
		}


		/// <summary>
		/// <see cref="Currency"/> for ordering.
		/// </summary>
		private static readonly CoinMarketCapCurrencyTicker[] fallbackValues =
		{
			new CoinMarketCapCurrencyTicker { price_usd = 10993.23m },
			new CoinMarketCapCurrencyTicker { price_usd = 333.881m },
			new CoinMarketCapCurrencyTicker { price_usd = 68.3853m },
			new CoinMarketCapCurrencyTicker { price_usd = 990.14m },
			new CoinMarketCapCurrencyTicker { price_usd = 426.83m },
			new CoinMarketCapCurrencyTicker { price_usd = 0.002m }
		};

		private static readonly DateTime[] lastTimeUpdatedTicker = new DateTime[6];

		private static async Task<string> GetHttpResponse(string url)
			=> await (await new HttpClient(AutoDecompression).GetAsync(url)).Content.ReadAsStringAsync();

		private static HttpMessageHandler AutoDecompression
			=> new HttpClientHandler
			{
				AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
			};
	}
}