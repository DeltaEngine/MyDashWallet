using System;

namespace MyDashWallet.Node
{
	public class SigningRawTxFailed : Exception
	{
		public SigningRawTxFailed(string message) : base(message) {}
	}
}