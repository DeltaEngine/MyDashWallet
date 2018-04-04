namespace MyDashWallet.Node
{
	public class RawTxHashesAndRawTx
	{
		public string[] TxHashes { get; set; }
		public string RawTx { get; set; }
		public decimal UsedSendTxFee { get; set; }
		public string RedirectedPrivateSendAddress { get; set; }
		public decimal RedirectedPrivateSendAmount { get; set; }
	}
}