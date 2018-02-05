using System.Collections.Generic;
using BitcoinLib.Requests.CreateRawTransaction;
using BitcoinLib.Requests.SignRawTransaction;
using BitcoinLib.Responses;
using BitcoinLib.Services.Coins.Dash;

namespace MyDashWallet.Services
{
	/// <summary>
	/// Basic integration into RPC dash testnet node without advanced features, easier for testing.
	/// </summary>
	public class TestnetDashNode : DashNode
	{
		/// <summary>
		/// None of the default values are used in production, this is just for local testing
		/// </summary>
		public TestnetDashNode(string server = "http://localhost:19998", string user = "MyDashWallet",
			string password = "localOnly", short requestTimeoutInSeconds = 30)
			=> service = new DashService(server, user, password, password, requestTimeoutInSeconds);

		protected readonly DashService service;
		public override decimal GetTotalBalance() => service.GetBalance("", -1, null);
		public override string GetRawUtxo(string tx) => service.GetRawTransaction(tx, 0).Hex;

		public override decimal GetTxOutputAmount(string tx, int outputIndex)
			=> service.GetRawTransaction(tx, 1).Vout[outputIndex].Value;

		public override string GenerateRawTx(List<TxInput> inputs, List<TxOutput> outputs)
		{
			var request = new CreateRawTransactionRequest();
			foreach (var input in inputs)
				request.AddInput(input.Tx, input.OutputIndex);
			foreach (var output in outputs)
				request.AddOutput(output.Address, output.Amount);
			AdditionalErrorInformation = request;
			return service.CreateRawTransaction(request);
		}

		public override string SignRawTx(string rawTx)
		{
			//TODO: for privatekey signing we need to use the third parameter!
			//signrawtransaction "hexstring" ( [{"txid":"id","vout":n,"scriptPubKey":"hex","redeemScript":"hex"},...] ["privatekey1",...] sighashtype )
			//The second optional argument (may be null) is an array of previous transaction outputs that this transaction depends on but may not yet be in the block chain.
			//The third optional argument (may be null) is an array of base58-encoded private keys that, if given, will be the only keys used to sign the transaction.
			var request = new SignRawTransactionRequest(rawTx);
			AdditionalErrorInformation = request;
			var result = service.SignRawTransactionWithErrorSupport(request);
			if (result.Complete)
				return result.Hex;
			throw new SigningRawTxFailed(result.Errors.Count > 0 ? result.Errors[0].Error : "");
		}

		public override string BroadcastSignedTxIntoDashNetwork(string signedTx, bool useInstantSend)
			=> service.SendRawTransaction(signedTx, false, useInstantSend);

		public DecodeRawTransactionResponse DecodeRawTransaction(string txHash)
			=> service.DecodeRawTransaction(txHash);

		protected override string CreateNewPrivateSendReceiveAddress(string amountToAddress)
			=> service.GetNewAddress(amountToAddress);
	}
}