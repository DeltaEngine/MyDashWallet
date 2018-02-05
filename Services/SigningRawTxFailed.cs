using System;

namespace MyDashWallet.Services
{
	public class SigningRawTxFailed : Exception
	{
		public SigningRawTxFailed(string message) : base(message) {}
	}
}