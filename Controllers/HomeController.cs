using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MyDashWallet.Models;
using MyDashWallet.Services;
using Newtonsoft.Json;

namespace MyDashWallet.Controllers
{
	public class HomeController : Controller
	{
		public HomeController(DashNode node) => this.node = node;
		private readonly DashNode node;

		public async Task<IActionResult> Index()
		{
			await UpdateDashPrice();
			return View();
		}

		private async Task UpdateDashPrice()
		{
			var ticker = await CoinMarketCapUsdExchangeRates.GetTicker();
			ViewData["UsdRate"] = ticker.price_usd;
			ViewData["EurRate"] = ticker.price_eur;
			ViewData["BtcRate"] = ticker.price_btc;
			ViewData["GbpRate"] = ticker.price_gbp;
			ViewData["DashPrices"] = "$" + ticker.price_usd.ToString("#0.00") + " = €" +
				ticker.price_eur.ToString("#0.00") + " = £" + ticker.price_gbp.ToString("#0.00");
			ViewData["MilliDashPrices"] = "$" + (ticker.price_usd / 1000.0m).ToString("#0.00") +
				" = €" + (ticker.price_eur / 1000.0m).ToString("#0.00") + " = £" +
				(ticker.price_gbp / 1000.0m).ToString("#0.00");
		}
		
		public async Task<IActionResult> Swap()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> Address()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> Transaction()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> Tipping()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> About()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutCreateNewWallet()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutHardwareWallets()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutLedgerHardwareWallet()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutTrezorHardwareWallet()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutMyDashWallet()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutTransactionFees()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutInstantSend()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutPrivateSend()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> AboutVideos()
		{
			await UpdateDashPrice();
			return View();
		}

#if DEBUG
		public async Task<IActionResult> TestLedger()
		{
			await UpdateDashPrice();
			return View();
		}

		public async Task<IActionResult> TestTrezor()
		{
			await UpdateDashPrice();
			return View();
		}
#endif
		public async Task<IActionResult> Error()
		{
			await UpdateDashPrice();
			ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
			return View();
		}
		
		[HttpGet]
		public IActionResult GenerateRawTx(string utxos, string amountToAddress,
			string remainingAmountToAddress, bool instantSend, bool privateSend)
		{
			try
			{
				node.UserIp = HttpContext.Connection.RemoteIpAddress.ToString();
				return Json(node.TryGenerateRawTx(utxos, amountToAddress, remainingAmountToAddress,
					instantSend, privateSend));
			}
			catch (Exception ex)
			{
				return GetErrorResult(ex, "Failed to generate raw tx");
			}
		}

		private IActionResult GetErrorResult(Exception ex, string errorMessage)
		{
			if (ex.Message == "No information available about transaction")
				return StatusCode(500,
					"Unable to generate raw tx, inputs are not found in the Dash blockchain " +
					"(are you on testnet or have an invalid address or transaction id?)");
			if (ex.Message.Contains(
				"16: mandatory-script-verify-flag-failed (Script failed an OP_EQUALVERIFY operation)"))
				errorMessage += ": Wrong inputs were signed (used address index is already spent), " +
					"unable to confirm signed transaction. Double spends are not allowed!<br/>Details";
			errorMessage += ": " +
#if DEBUG
				ex.ToString().Replace("MyDashWallet.Controllers.HomeController+", "").
					Replace("MyDashWallet.Controllers.HomeController.", "");
#else
				ex.GetType().Name + ": " + ex.Message;
#endif
			if (node.AdditionalErrorInformation != null)
				errorMessage += "<br/><br/>Additional Information: " +
					JsonConvert.SerializeObject(node.AdditionalErrorInformation);
			return StatusCode(500, errorMessage);
		}

		[HttpGet]
		public IActionResult SendSignedTx(string signedTx, bool instantSend)
		{
			try
			{
				node.UserIp = HttpContext.Connection.RemoteIpAddress.ToString();
				return Ok(node.BroadcastSignedTxIntoDashNetwork(signedTx, instantSend));
			}
			catch (Exception ex)
			{
				return GetErrorResult(ex, "Failed to send signed tx");
			}
		}
	}
}