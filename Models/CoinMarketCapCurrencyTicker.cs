namespace MyDashWallet.Models
{
	/// <summary>
	/// Based on https://coinmarketcap.com/api/ for example:
	/// https://api.coinmarketcap.com/v1/ticker/bitcoin/
	/// </summary>
	public class CoinMarketCapCurrencyTicker
	{
		public string id;
		public string name;
		public string symbol;
		public int rank;
		public decimal price_usd;
		public decimal price_btc;
		public decimal price_eur;
		public decimal price_gbp;
		// We don't care about the rest of the fields
	}
}