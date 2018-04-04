using System;
using System.Collections.Generic;
using System.Globalization;
using MyDashWallet.Node.Tests.Mocks;
using NUnit.Framework;

namespace MyDashWallet.Node.Tests
{
	public class DashNodeTests
	{
		[SetUp]
		public void CreateNode()
		{
			node = StartedFromNCrunch ? (DashNode)new MockDashNode() : new TestnetDashNode();
		}

		private DashNode node;
		public static bool StartedFromNCrunch => Environment.GetEnvironmentVariable("NCrunch") == "1";

		[Test]
		public void GetTotalBalance()
		{
			Assert.That(node.GetTotalBalance(), Is.GreaterThan(0m));
			Console.WriteLine("Dash node balance: " + node.GetTotalBalance());
		}

		/*
		[Test]
		public void GenerateMyNewAddress()
		{
			Console.WriteLine("New Address: " + node.GenerateNewAddress("Telegramm|Gustav"));
		}
		*/

		[Test]
		public void GetUserBalance()
		{
			Console.WriteLine(node.GetUserAddressBalance("yX7aHGUas8iZ2V6cSvkS5oLSkXowzJehzj"));
		}

		//[Test]
		public void GetUserBalanceOfInvalidUser()
		{
			Console.WriteLine(node.GetUserAddressBalance("djDFle2094kjsdfkjdpüsf9qwr39jrm"));
		}

		[Test]
		public void CheckNormalTxFee()
		{
			Assert.That(node.CalculateTxFee(1, 1, false, false), Is.EqualTo(0.00000192m));
			Assert.That(node.CalculateTxFee(1, 2, false, false), Is.EqualTo(0.00000226m));
			Assert.That(node.CalculateTxFee(2, 1, false, false), Is.EqualTo(0.00000340m));
			Assert.That(node.CalculateTxFee(2, 2, false, false), Is.EqualTo(0.00000374m));
			Assert.That(node.CalculateTxFee(3, 2, false, false), Is.EqualTo(0.00000522m));
			Assert.That(node.CalculateTxFee(7, 2, false, false), Is.EqualTo(0.00001114m));
		}

		[Test]
		public void CheckInstantSendFee()
		{
			Assert.That(node.CalculateTxFee(1, 2, true, false), Is.EqualTo(0.0001m));
			var inputs = new[] { 0.1m, 0.0001m, 0.5m };
			Assert.That(node.CalculateTxFee(inputs.Length, 2, true, false), Is.EqualTo(0.0003m));
		}

		[Test]
		public void CheckPrivateSendFee()
		{
			var inputs = new[] { 1m, 1m, 1m, 1m, 1m, 0.1m, 0.1m, 0.01m };
			Assert.That(node.CalculateTxFee(inputs.Length, 2, false, false), Is.EqualTo(0.00001262m));
			Assert.That(node.CalculateTxFee(inputs.Length, 2, false, true),  Is.EqualTo(0.00019262m));
			Assert.That(node.CalculateTxFee(inputs.Length, 2, true, true),   Is.EqualTo(0.00098m));
		}

		[Test]
		public void CorrectlyRoundDashNumber()
		{
			Assert.That(
				DashNode.GetCorrectDashNumberInDuffs(0.1m).ToString(CultureInfo.InvariantCulture),
				Is.EqualTo("0.1"));
			Assert.That(
				DashNode.GetCorrectDashNumberInDuffs(0.00016m).ToString(CultureInfo.InvariantCulture),
				Is.EqualTo("0.00016"));
			Assert.That(
				DashNode.GetCorrectDashNumberInDuffs(0.00016000001m).ToString(CultureInfo.InvariantCulture),
				Is.EqualTo("0.00016"));
		}

		[Test]
		public void GetRawUtxo()
		{
			// This will only work in testnet (debug mode), test via console:
			// getrawtransaction f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0
			var txHash = node.GetRawUtxo(
				//work pc: "ec13052157aa114aee0cdf57b68d84009bf04ef679e99b36c4d0ab59dc81c26a");
				"f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0");
			Assert.That(txHash, Is.EqualTo("0100000001387157c23c819d0a0540d5376950ba5a9d0accd56b6302f99760c413b27a0395010000006a47304402205c0c1090f02f1592a3a751a2600c9ac2c69413303d7341d587ed3d4360ed1905022061aaa7c8316f7a08d934214eb0430dcee7bbea21f1c3da402cb890d4765f34d10121035416e79ee9f42c4c14becc7346211649aa17cf6e222e0d21ce3e65c0c8e85e9bfeffffff025e410f00000000001976a91474b0fc14756e19a9c40d791fea47a93b1562413988ac64ec84ed090000001976a9143d2f1a30f6bc98476fc114f870df69b689c2332b88ac3a810000"));
		}
		
		[Test]
		public void GetTxOutputAmount()
		{
			// This will only work in testnet (debug mode)
			var amount = node.GetTxOutputAmount(
				//work pc: "ec13052157aa114aee0cdf57b68d84009bf04ef679e99b36c4d0ab59dc81c26a", 0);
				"f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0", 0);
			Assert.That(amount, Is.EqualTo(
				//work pc: 1.5m));
				0.00999774m));
		}
		
		[Test]
		public void GenerateRawTx()
		{
			// This will only work in testnet (debug mode)
			var sendAmount = 1m;
			var txFee = node.CalculateTxFee(1, 2, false, false);
			var inputAmount = 10m;
			rawTx = node.GenerateRawTx(
				new List<TxInput>
				{
					new TxInput("b437d3bd1682f39f35c4334f79f4b7161deac44ede2795fa4ad882b04dccb8ea", 0,
						inputAmount)
				},
				new List<TxOutput>
				{
					new TxOutput("yafaeGnpEdcJuwHnupozxx1TUdwQik4Ldp", sendAmount), //to server test wallet
					new TxOutput("yhGZ9FCAEoYvjLiwWBqFsXAtNeezMHCz8j", inputAmount - (sendAmount + txFee))
				});
			//Console.WriteLine(rawTx);
			Assert.That(rawTx, Is.EqualTo("0100000001eab8cc4db082d84afa9527de4ec4ea1d16b7f4794f33c4359ff38216bdd337b40000000000ffffffff0200e1f505000000001976a9149d6096298938892ba16746896e6d7c9e2d4413dd88ac1ee8a435000000001976a914e5cea5bc37c04a5ce82589f487fb0e9bbcb8c86388ac00000000"));
		}
		private string rawTx;
		
		[Test]
		public void SignRawTxFromSpendInputThrowsError()
		{
			var inputAmount = 426.39617124m;
			Assert.Throws(Is.TypeOf<SigningRawTxFailed>().
					And.Message.EqualTo("Input not found or already spent: f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0:1"),
				() => node.SignRawTx(node.GenerateRawTx(
					new List<TxInput>
					{
						new TxInput("f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0", 1,
							inputAmount)
					}, new List<TxOutput>
					{
						new TxOutput("yafaeGnpEdcJuwHnupozxx1TUdwQik4Ldp", 1m), //to server test wallet
						new TxOutput("yhGZ9FCAEoYvjLiwWBqFsXAtNeezMHCz8j", inputAmount - 1.00000266m)
					})));
		}
		
		[Test]
		public void BuildPrivateSendTransaction()
		{
			// Tx from mainnet as this is difficult to reproduce in testnet
			const decimal TotalInputAmount = 0.00125025m;
			const decimal InputToAddressAmount = 0.001m;
			const string InputToAddress = "XoASepVfo1cegWp52HS9gbcKuarLyqxsKT";
			decimal inputTxFee = node.CalculateTxFee(1, 2, false, true);
			const string InputRemainingAddress = "Xjm6MySEGGmRqkTqnMfxeAscye395RV2x6";
			decimal remainingAmount = TotalInputAmount - (InputToAddressAmount + inputTxFee);
			// PrivateSend first needs to go to the mixing wallet, use small fee for that
			decimal redirectedTxFee = node.CalculateTxFee(1, 2, false, false);
			decimal redirectedAmount = TotalInputAmount - (remainingAmount + redirectedTxFee);
			var rawTxHashesAndRawTx = node.TryGenerateRawTx(
				"d0253484a89d23fb47d5f33858dab316e2ce09806768bd68b8efdbc3e5586c2f|1",
				InputToAddressAmount, InputToAddress,
				remainingAmount, InputRemainingAddress, false, true);
			Assert.That(rawTxHashesAndRawTx.TxHashes, Has.Length.EqualTo(1));
			if (node is MockDashNode)
				return;
			//ncrunch: no coverage start
			Console.WriteLine("Tx Input Hash: " + rawTxHashesAndRawTx.TxHashes[0]);
			var txInput = (node as TestnetDashNode).DecodeRawTransaction(rawTxHashesAndRawTx.TxHashes[0]);
			Assert.That(txInput.Vin, Has.Count.EqualTo(1));
			Assert.That(txInput.Vout[0].N, Is.EqualTo(0));
			// Old tx used for input here also went to same donation address and has itself as chance
			Assert.That(txInput.Vout[0].Value, Is.EqualTo(0.00001m));
			Assert.That(txInput.Vout[0].ScriptPubKey.Addresses[0], Is.EqualTo(InputToAddress));
			Assert.That(txInput.Vout[1].Value, Is.EqualTo(0.00125025m));
			Assert.That(txInput.Vout[1].ScriptPubKey.Addresses[0], Is.EqualTo(InputRemainingAddress));
			Console.WriteLine("RawTx Hash: " + rawTxHashesAndRawTx.RawTx);
			var tx = (node as TestnetDashNode).DecodeRawTransaction(rawTxHashesAndRawTx.RawTx);
			Assert.That(tx.Vin, Has.Count.EqualTo(1));
			Assert.That(tx.Vin[0].TxId, Is.EqualTo(txInput.TxId));
			Assert.That(tx.Vout, Has.Count.EqualTo(2));
			// We should NOT use InputToAddress or InputToAddressAmount here, but redirect this!
			Assert.That(tx.Vout[0].ScriptPubKey.Addresses[0], Is.Not.EqualTo(InputToAddress));
			Assert.That(tx.Vout[0].Value,
				Is.Not.EqualTo(InputToAddressAmount).And.EqualTo(redirectedAmount));
			// Remaining amount should stay unchanged
			Assert.That(tx.Vout[1].Value, Is.EqualTo(remainingAmount));
			Assert.That(tx.Vout[1].ScriptPubKey.Addresses[0], Is.EqualTo(InputRemainingAddress));
			Assert.That(tx.Vout[0].Value + tx.Vout[1].Value + redirectedTxFee,
				Is.EqualTo(TotalInputAmount));
			//ncrunch: no coverage end
		}

		[Test]
		public void SendSignedTransaction()
		{
			// This can only be executed once in testnet, then tx input is spend and not longer useable
			GenerateRawTx();
			// Signing for hardware wallets is done on the website, we can directly broadcast signed txs
			var signedTx = node.SignRawTx(rawTx);
			Console.WriteLine("Final tx: " + node.BroadcastSignedTxIntoDashNetwork(signedTx, false));
		}

		[Test]
		public void SendSignedTransactionWithInstantSend()
		{
			// Again, can only be executed once, after that the tx input is spend and not longer useable
			var sendAmount = 0.1m;
			var txFee = node.CalculateTxFee(1, 2, true, false);
			var inputAmount = 8.99999734m;
			rawTx = node.GenerateRawTx(
				new List<TxInput>
				{
					new TxInput("8825a00189a62f4a356ba9d86a712f1004013f901383f2876fe9626786627537", 1,
						inputAmount)
				},
				new List<TxOutput>
				{
					new TxOutput("yafaeGnpEdcJuwHnupozxx1TUdwQik4Ldp", sendAmount), //to server test wallet
					//back to same address, needed later for single address wallets
					new TxOutput("yhGZ9FCAEoYvjLiwWBqFsXAtNeezMHCz8j", inputAmount - (sendAmount + txFee))
				});
			var signedTx = node.SignRawTx(rawTx);
			Console.WriteLine("Final tx: " + node.BroadcastSignedTxIntoDashNetwork(signedTx, true));
		}
		
		//ncrunch: no coverage start
		[Test, Category("Slow")]
		public void GenerateRealTransaction()
		{
			// Will only work in mainnet, sending 0.1mDASH to donation address
			//GenerateRawTx?utxos=|0||0|&amountToAddress=0.0001|XoASepVfo1cegWp52HS9gbcKuarLyqxsKT&remainingAmountToAddress=0.0009962600000000001|Xv1Tfr7aFwfSsaYkTMtVe3nBK6XsWgtiFy&instantSend=false&privateSend=false
			var sendAmount = 0.0001m;
			var txFee = node.CalculateTxFee(2, 2, false, false);
			var tx1 = "7fbbceeea88cebeff25137bcea4ae182547e306c213be4c7837e211c2004bfc7";
			var inputAmountTx1 = node.GetTxOutputAmount(tx1, 0);
			var tx2 = "5ca1172324012b0208dd4e00e5c81172ed674f2cc4d2c391746ef09e2bb07c71";
			var inputAmountTx2 = node.GetTxOutputAmount(tx2, 0);
			rawTx = node.GenerateRawTx(
				new List<TxInput>
				{
					new TxInput(tx1, 0,inputAmountTx1),
					new TxInput(tx2, 0,inputAmountTx2)
				},
				new List<TxOutput>
				{
					new TxOutput("XoASepVfo1cegWp52HS9gbcKuarLyqxsKT", sendAmount),
					new TxOutput("Xv1Tfr7aFwfSsaYkTMtVe3nBK6XsWgtiFy",
						inputAmountTx1+inputAmountTx2 - (sendAmount + txFee))
				});
			Console.WriteLine(rawTx);
			Assert.That(rawTx, Is.EqualTo("0100000002c7bf04201c217e83c7e43b216c307e5482e14aeabc3751f2efeb8ca8eecebb7f0000000000ffffffff717cb02b9ef06e7491c3d2c42c4f67ed7211c8e5004edd08022b01242317a15c0000000000ffffffff0210270000000000001976a91488d9ce86369df69ee9fb0aa0f887c4297133bf1788ac2a850100000000001976a914d3efcb09c5d3615d06d9438efe4af7d7d556880e88ac00000000"));
			/*decoderawtransaction "vout": [
			{
				"value": 0.00010000,
				"valueSat": 10000,
				"n": 0,
				"scriptPubKey": {
					"asm": "OP_DUP OP_HASH160 88d9ce86369df69ee9fb0aa0f887c4297133bf17 OP_EQUALVERIFY OP_CHECKSIG",
					"hex": "76a91488d9ce86369df69ee9fb0aa0f887c4297133bf1788ac",
					"reqSigs": 1,
					"type": "pubkeyhash",
					"addresses": [
					"XoASepVfo1cegWp52HS9gbcKuarLyqxsKT"
						]
				}
			}, 
			{
				"value": 0.00099626,
				"valueSat": 99626,
				"n": 1,
				"scriptPubKey": {
					"asm": "OP_DUP OP_HASH160 d3efcb09c5d3615d06d9438efe4af7d7d556880e OP_EQUALVERIFY OP_CHECKSIG",
					"hex": "76a914d3efcb09c5d3615d06d9438efe4af7d7d556880e88ac",
					"reqSigs": 1,
					"type": "pubkeyhash",
					"addresses": [
					"Xv1Tfr7aFwfSsaYkTMtVe3nBK6XsWgtiFy"
						]
				}
			}
			*/
		}
	}
}