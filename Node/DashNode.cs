using System;
using System.Collections.Generic;
using BitcoinLib.Services.Coins.Dash;

namespace MyDashWallet.Node
{
	public abstract class DashNode
	{
		public abstract decimal GetTotalBalance();
		public abstract decimal GetUserAddressBalance(string userAddress);
		public abstract decimal GetUserAddressReceived(string userAddress);
		public abstract List<ListUnspentDashResponse> GetUnspentDashOutputs();
		public abstract string GenerateNewAddress(string userLabel, bool forPrivateSendTx);
		public abstract string GetRawUtxo(string tx);
		public abstract decimal GetTxOutputAmount(string tx, int outputIndex);
		public abstract string GenerateRawTx(List<TxInput> inputs, List<TxOutput> outputs);
		public abstract string SignRawTx(string rawTx);
		public abstract string BroadcastSignedTxIntoDashNetwork(string signedTx, bool useInstantSend);
		public string UserIp { get; set; }

		public decimal CalculateTxFee(int numberOfInputs, int numberOfOutputs, bool useInstantSend,
			bool usePrivateSend)
		{
			if (numberOfInputs < 0)
				numberOfInputs = 1;
			if (numberOfOutputs < 0)
				numberOfOutputs = 1;
			// See index.js updateTxFee function, actual fee from tests:
			// 1 input, 2 outputs, No instantSend, No PrivateSend: 226duffs
			// 2 inputs, 2 outputs, No instantSend, No PrivateSend: 374duffs
			// 8 inputs, 1 output, No instantSend, No PrivateSend: 1224duffs
			// 8 inputs, 2 outputs, No instantSend, No PrivateSend: 1262dufs
			// 1 input, 2 outputs, InstantSend: 0.1mDASH
			// 2 input, 2 outputs, InstantSend: 0.2mDASH
			// 8 inputs, 2 outputs, PrivateSend: 0.19262mDASH
			var txFeeInMDash = BaseMilliFee + MilliFeePerInput * numberOfInputs +
				MilliFeePerOutput * numberOfOutputs;
			// The user also needs to pay for mixing and sending the initial tx
			if (useInstantSend)
				txFeeInMDash = 0.1m * numberOfInputs;
			if (usePrivateSend)
				txFeeInMDash += 0.25m + 0.05m * numberOfInputs;
			return txFeeInMDash / 1000m;
		}

		/// <summary>
		/// Formula is 10 duffs (base) + 148 duffs (per input) + 34 duffs (per output)
		/// 1 inputs 1 outputs is 192 duffs = 10 + 148 + 34
		/// 1 inputs 2 outputs is 226 duffs = 10 + 148 + 2 * 34
		/// 2 inputs 2 outputs is 374 duffs = 10 + 2 * 148 + 2 * 34
		/// </summary>
		protected const decimal BaseMilliFee = 0.00010m;
		protected const decimal MilliFeePerInput = 0.00148m;
		protected const decimal MilliFeePerOutput = 0.00034m;

		public virtual RawTxHashesAndRawTx TryGenerateRawTx(string utxos, decimal amount, string sendTo,
			decimal remainingAmount, string remainingAddress, bool instantSend, bool privateSend)
		{
			AdditionalErrorInformation = null;
			string[] utxoParts = utxos.Split('|', StringSplitOptions.RemoveEmptyEntries);
			var result = new RawTxHashesAndRawTx { TxHashes = new string[utxoParts.Length / 2] };
			List<TxInput> inputs = new List<TxInput>();
			for (int i = 0; i < utxoParts.Length / 2; i++)
			{
				var tx = utxoParts[i * 2];
				var outputIndex = int.Parse(utxoParts[i * 2 + 1]);
				result.TxHashes[i] = GetRawUtxo(tx);
				inputs.Add(new TxInput(tx, outputIndex, GetTxOutputAmount(tx, outputIndex)));
			}
			var totalInputAmount = 0m;
			foreach (var input in inputs)
				totalInputAmount += input.Amount;
			List<TxOutput> outputs = new List<TxOutput>();
			// The actual used tx fee is always based on the inputs, privatesend needs to modify amounts!
			bool hasRemainingOutput = remainingAmount > 0;
			result.UsedSendTxFee =
				CalculateTxFee(inputs.Count, hasRemainingOutput ? 2 : 1, instantSend, false);
			result.RedirectedPrivateSendAddress = sendTo;
			result.RedirectedPrivateSendAmount = amount;
			// For PrivateSend redirect to new address created on MyDashWallet and send from mixed pool
			if (privateSend)
			{
				result.RedirectedPrivateSendAddress = GenerateNewAddress(amount + "|" + sendTo, true);
				/*unused
				var remainingAmount = 0m;
				if (hasRemainingOutput)
					remainingAmount = ParseAmountAndAddress(remainingAmountToAddress).Amount;
				*/
				result.RedirectedPrivateSendAmount =
					GetCorrectDashNumberInDuffs(totalInputAmount - (remainingAmount + result.UsedSendTxFee));
				//this is amount: var amountToSendAfterMixing = ParseAmountAndAddress(amountToAddress).Amount;
				// Fallback needed when there are no inputs (e.g. Trezor)
				if (totalInputAmount == 0m)
					result.RedirectedPrivateSendAmount = amount + GetPrivateSendTxFee(amount);
				else
				{
					// As always, all values from the javascript client MUST be double-checked.
					var privateSendActualFee = result.RedirectedPrivateSendAmount - amount;
					var privateSendNeededFee = GetPrivateSendTxFee(amount);
					if (privateSendActualFee < privateSendNeededFee)
						throw new TxFeeIsWrongForPrivateSend(privateSendActualFee, privateSendNeededFee);
				}
				outputs.Add(new TxOutput(result.RedirectedPrivateSendAddress,
					result.RedirectedPrivateSendAmount));
			}
			else
				outputs.Add(new TxOutput(sendTo, amount));
			if (hasRemainingOutput)
				outputs.Add(new TxOutput(remainingAddress, remainingAmount));
			// We can only generate the raw tx if we have valid inputs (not for Trezor)
			if (totalInputAmount == 0m)
				return result;
			ConfirmTxInputsAndTxOutputValuesWithTxFeeMatch(inputs, outputs, result.UsedSendTxFee);
			result.RawTx = GenerateRawTx(inputs, outputs);
			return result;
		}
		
		public object AdditionalErrorInformation { get; protected set; }

		public static decimal GetPrivateSendTxFee(decimal amountToSendAfterMixing)
			=> (0.1m + 0.025m * GetPrivateSendNumberOfInputsBasedOnAmount(amountToSendAfterMixing)) /
				1000m;

		/// <summary>
		/// Same code as in index.js getPrivateSendNumberOfInputsBasedOnAmount
		/// Amounts are: 10mDASH, 100mDASH, 1 DASH, 10 DASH
		/// https://dashpay.atlassian.net/wiki/spaces/DOC/pages/1146924/PrivateSend
		/// </summary>
		private static int GetPrivateSendNumberOfInputsBasedOnAmount(decimal amountToSend)
		{
			if (amountToSend <= 0.01m)
				return 1;
			var numberOfPrivateSendInputsNeeded = 1;
			while (amountToSend > 10m) {
				numberOfPrivateSendInputsNeeded++;
				amountToSend -= 10;
			}
			while (amountToSend > 1m) {
				numberOfPrivateSendInputsNeeded++;
				amountToSend -= 1;
			}
			while (amountToSend > 0.1m) {
				numberOfPrivateSendInputsNeeded++;
				amountToSend -= 0.1m;
			}
			while (amountToSend > 0.01m) {
				numberOfPrivateSendInputsNeeded++;
				amountToSend -= 0.01m;
			}
			return numberOfPrivateSendInputsNeeded;
		}

		public class TxFeeIsWrongForPrivateSend : Exception
		{
			public TxFeeIsWrongForPrivateSend(decimal privateSendActualFee, decimal privateSendNeededFee)
				: base("Unable to generate PrivateSend transaction, not enough (" + privateSendActualFee +
				") DASH for PrivateSend tx fee was provided, but " + privateSendNeededFee +
				" is needed!") {}
		}

		/*not longer needed
		protected static TxOutput ParseAmountAndAddress(string amountAndAddress)
		{
			string[] parts = amountAndAddress.Split('|');
			return new TxOutput(parts[1], GetCorrectDashNumberInDuffs(decimal.Parse(parts[0])));
		}
		*/

		private static void ConfirmTxInputsAndTxOutputValuesWithTxFeeMatch(List<TxInput> inputs,
			List<TxOutput> outputs, decimal txFee)
		{
			var totalInputAmount = 0.0m;
			foreach (var input in inputs)
				totalInputAmount += input.Amount;
			var totalOutputAmount = 0.0m;
			foreach (var output in outputs)
				totalOutputAmount += output.Amount;
			if (totalInputAmount != totalOutputAmount + txFee)
			{
				// If the amount is just slightly off, fix it here by adjusting the last output (change)
				// This can happen because javascript is not using decimals and we might have some tiny
				// error beyond the 8 decimals used. Also if anything is wrong with the fee, fix it here.
				if (Math.Abs(totalInputAmount - (totalOutputAmount + txFee)) < 0.00024m)
				{
					if (outputs.Count == 2)
						outputs[1].Amount =
							GetCorrectDashNumberInDuffs(totalInputAmount - (txFee + outputs[0].Amount));
					else
						// If we just have one output, spend it all
						outputs[0].Amount = GetCorrectDashNumberInDuffs(totalInputAmount - txFee);
				}
				else
					// Otherwise the problem is big, abort and report error to user
					throw new InputAmountsDoNotMatchOutputAmountsWithTxFee(totalInputAmount,
						totalOutputAmount, txFee);
			}
		}

		/// <summary>
		/// The Dash rpc node will only accept DASH numbers that are full duff numbers
		/// (1 DASH = 100 000 000 duffs), make sure we will not use slight rounding errors.
		/// Also will remove trailing zeros as described here, which causes confusing values when
		/// building the raw tx and signing it with hardware devices (might display higher values).
		/// https://stackoverflow.com/questions/4525854/remove-trailing-zeros
		/// </summary>
		public static decimal GetCorrectDashNumberInDuffs(decimal amount)
			=> decimal.Round(amount, 8, MidpointRounding.AwayFromZero) /
				1.000000000000000000000000000000000m;

		public static decimal ConvertDuffsToDashAmount(long duffs) => duffs / 100000000m;

		private class InputAmountsDoNotMatchOutputAmountsWithTxFee : Exception
		{
			public InputAmountsDoNotMatchOutputAmountsWithTxFee(decimal totalInputAmount,
				decimal totalOutputAmount, decimal txFee) : base("Input amounts: " + totalInputAmount +
				" != Output amounts: " + GetCorrectDashNumberInDuffs(totalOutputAmount) + " + Tx fee: " +
				GetCorrectDashNumberInDuffs(txFee) + " (input amounts should be " +
				GetCorrectDashNumberInDuffs(totalOutputAmount + txFee) + ")") {}
		}
		/*all only in TippingDashNode
		public abstract string SendDirectlyFromUserAddressToUserAddress(string senderAddress,
			string receiverAddress, decimal amount);

		public string ToUserLabel(string channel, string userId) => channel + "|" + userId;
		public abstract string GetSendToDashAddressFromTipAccount(string channel, string sendTo);
		public abstract void AddTip(string channel, string senderUserId, string receiverUserId,
			string txId, decimal milliAmount, string extraText);
		public abstract void UpdateTipTxId(string channel, string userId, string txId);
		*/
	}
}