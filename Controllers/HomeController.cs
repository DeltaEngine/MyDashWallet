using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyDashWallet.Node;
using Newtonsoft.Json;
using SocialCryptoBots;
using Tweetinvi;
using Tweetinvi.Credentials.Models;
using Tweetinvi.Models;

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
			var ticker = await CurrencyExtensions.GetTicker(Currency.mDASH);
			ViewData["UsdRate"] = ticker.price_usd;
			ViewData["EurRate"] = ticker.price_eur;
			ViewData["BtcRate"] = ticker.price_btc;
			ViewData["DashPrices"] = "$" + ticker.price_usd.ToString("#0.00") + " = €" +
				ticker.price_eur.ToString("#0.00");
			ViewData["MilliDashPrices"] = "$" + (ticker.price_usd / 1000.0m).ToString("#0.00") +
				" = €" + (ticker.price_eur / 1000.0m).ToString("#0.00");
			UpdateCachedMixingPoolAmounts();
			ViewData["DashMixingPoolAmount"] = dashMixingPoolAmount.ToString("#0.#");
			ViewData["DashMixingPoolPremixed"] = dashMixingPoolPremixed.ToString("#0.#");
		}

		private void UpdateCachedMixingPoolAmounts()
		{
			if (DateTime.UtcNow.AddMinutes(-5) < lastTimeCheckedDashMixingPool)
				return;
			lastTimeCheckedDashMixingPool = DateTime.UtcNow;
			dashMixingPoolAmount = 0m;
			dashMixingPoolPremixed = 0m;
			try
			{
				foreach (var output in node.GetUnspentDashOutputs())
				{
					dashMixingPoolAmount += output.Amount * 1000m;
					if (output.Ps_Rounds >= 2)
						dashMixingPoolPremixed += output.Amount * 1000m;
				}
			}
			catch
			{
				// ignored, if this crashes we use 0 for the mixing pool display
			}
		}

		private DateTime lastTimeCheckedDashMixingPool;
		private decimal dashMixingPoolAmount;
		private decimal dashMixingPoolPremixed;

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
		
		public async Task<IActionResult> Mixing()
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
		public IActionResult TestLedger() => View();
		public IActionResult TestTrezor() => View();
		public IActionResult ScanQR() => View();
#endif
		public async Task<IActionResult> Error()
		{
			await UpdateDashPrice();
			ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
			return View();
		}

		public IActionResult Redeem()
		{
			var redirectUrl = "//MyDashWallet.org/RedeemRedirect";
			var context = AuthFlow.InitAuthentication(TwitterConsumerCredentials, redirectUrl);
			TwitterAuthKey = context.Token.AuthorizationKey;
			TwitterAuthSecret = context.Token.AuthorizationSecret;
			return Redirect(context.AuthorizationURL);
		}

		public static string TwitterAuthKey;
		public static string TwitterAuthSecret;
		public static IConsumerCredentials TwitterConsumerCredentials
			=> new ConsumerCredentials("QvLbPlqr0B78lNVPZGU5zMCI0",
				"LWdDRdxaHjxmJ3wOtXyWHsTB5ZgG6ghmeIY240Ak1H21tyQ28A");

		public IActionResult RedeemRedirect()
		{
			try
			{
				var token = new AuthenticationToken
				{
					AuthorizationKey = TwitterAuthKey,
					AuthorizationSecret = TwitterAuthSecret,
					ConsumerCredentials = TwitterConsumerCredentials
				};
				var verifierCode = Request.Query["oauth_verifier"];
				var userCreds = AuthFlow.CreateCredentialsFromVerifierCode(verifierCode, token);
				var user = Tweetinvi.User.GetAuthenticatedUser(userCreds);
				ViewData["Result"] = "Failed to authenticate: No redeem link stored for @" + user.ScreenName;
			}
			catch (Exception ex)
			{
				ViewData["Result"] = "Failed to authenticate: " +
#if DEBUG
					ex;
#else
					ex;//.Message;
#endif
			}
			return View();
		}

		[HttpGet]
		public IActionResult GenerateRawTx(string utxos, string channel, decimal amount, string sendTo,
			decimal remainingAmount, string remainingAddress, bool instantSend, bool privateSend,
			string extraText)
		{
			try
			{
				node.UserIp = HttpContext.Connection.RemoteIpAddress.ToString();
				return Json(node.TryGenerateRawTx(utxos, amount, sendTo, remainingAmount, remainingAddress,
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
				var txId = node.BroadcastSignedTxIntoDashNetwork(signedTx, instantSend);
				return Ok(txId);
			}
			catch (Exception ex)
			{
				return GetErrorResult(ex, "Failed to send signed tx");
			}
		}

		[HttpGet]
		public IActionResult GeneratePrivateSendAddress(string toAddress)
		{
			try
			{
				node.UserIp = HttpContext.Connection.RemoteIpAddress.ToString();
				return Ok(node.GenerateNewAddress("0|" + toAddress, true));
			}
			catch (Exception ex)
			{
				return GetErrorResult(ex, "Failed to generate PrivateSend Address");
			}
		}
	}
}