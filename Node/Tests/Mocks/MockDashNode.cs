using System;
using System.Collections.Generic;
using BitcoinLib.Services.Coins.Dash;

namespace MyDashWallet.Node.Tests.Mocks
{
	public class MockDashNode : DashNode
	{
		public override decimal GetTotalBalance() => 1m;
		public override decimal GetUserAddressBalance(string userAddress) => 0m;
		public override decimal GetUserAddressReceived(string userAddress) => 0m;
		public override List<ListUnspentDashResponse> GetUnspentDashOutputs() => null;

		public override string GenerateNewAddress(string userLabel, bool forPrivateSendTx)
		{
			if (!forPrivateSendTx)
				return "Not supported";
			RememberAmountToAddress = userLabel;
			return "PrivateSendAddress";
		}

		public string RememberAmountToAddress { get; set; }

		public override string GetRawUtxo(string tx)
		{
			if (tx == "ec13052157aa114aee0cdf57b68d84009bf04ef679e99b36c4d0ab59dc81c26a")
				return "0100000001a01faa748b86c658f445d5f0f32ae91831ce142f86fe900076ae1e8e6c6547f7010000006b483045022100fe0da103e3bc60879d23f3503e66ea68ca8398c9405e79e6bfb3fa2c87c025c6022070625b62d47d6a6bdb78df0a6e5d572bc1a3ad1bbd09f525362583dd89cfa45d012102d2bab1f829fbdb4eba8e43c321be23e9fd895d3da01566a664495369f803541ffeffffff0280d1f008000000001976a914b22b8860fd45750b6ae28d3aa972af70b52efaf688ac021a94e4090000001976a9141fb73386873abeb025b11631007ee3966d2c65b888ace2a60000"; //ncrunch: no coverage, only on work pc
			if (tx == "f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0")
				return
					"0100000001387157c23c819d0a0540d5376950ba5a9d0accd56b6302f99760c413b27a0395010000006a47304402205c0c1090f02f1592a3a751a2600c9ac2c69413303d7341d587ed3d4360ed1905022061aaa7c8316f7a08d934214eb0430dcee7bbea21f1c3da402cb890d4765f34d10121035416e79ee9f42c4c14becc7346211649aa17cf6e222e0d21ce3e65c0c8e85e9bfeffffff025e410f00000000001976a91474b0fc14756e19a9c40d791fea47a93b1562413988ac64ec84ed090000001976a9143d2f1a30f6bc98476fc114f870df69b689c2332b88ac3a810000";
			return "";
		}

		public override decimal GetTxOutputAmount(string tx, int outputIndex)
		{
			if (tx == "ec13052157aa114aee0cdf57b68d84009bf04ef679e99b36c4d0ab59dc81c26a")
				return outputIndex == 0 ? 1.5m : 424.89616898m; //ncrunch: no coverage, only on work pc
			if (tx == "f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0")
				return outputIndex == 0 ? 0.00999774m : 426.39617124m;
			if (tx == "d0253484a89d23fb47d5f33858dab316e2ce09806768bd68b8efdbc3e5586c2f")
				return outputIndex == 0 ? 0.00001m : 0.00125025m;
			throw new NotSupportedException(); //ncrunch: no coverage
		}

		public override string GenerateRawTx(List<TxInput> inputs, List<TxOutput> outputs)
			=> inputs[0].Tx == "f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0" ? "0100000001a01faa748b86c658f445d5f0f32ae91831ce142f86fe900076ae1e8e6c6547f70100000000ffffffff0200e1f505000000001976a9149d6096298938892ba16746896e6d7c9e2d4413dd88ac5a0a8fe7090000001976a914e5cea5bc37c04a5ce82589f487fb0e9bbcb8c86388ac00000000" :
				inputs[0].Tx == "d0253484a89d23fb47d5f33858dab316e2ce09806768bd68b8efdbc3e5586c2f" ? "TODO" :
					"0100000001eab8cc4db082d84afa9527de4ec4ea1d16b7f4794f33c4359ff38216bdd337b40000000000ffffffff0200e1f505000000001976a9149d6096298938892ba16746896e6d7c9e2d4413dd88ac1ee8a435000000001976a914e5cea5bc37c04a5ce82589f487fb0e9bbcb8c86388ac00000000";

		/// <summary>
		/// Signing is faked and not mocked as we only have the real private keys in the node. Actually
		/// broadcasting a signed transaction will not do anything in this mock anyway, test in testnet.
		/// </summary>
		public override string SignRawTx(string rawTx)
		{
			if (rawTx == "0100000001a01faa748b86c658f445d5f0f32ae91831ce142f86fe900076ae1e8e6c6547f70100000000ffffffff0200e1f505000000001976a9149d6096298938892ba16746896e6d7c9e2d4413dd88ac5a0a8fe7090000001976a914e5cea5bc37c04a5ce82589f487fb0e9bbcb8c86388ac00000000")
				throw new SigningRawTxFailed("Input not found or already spent: " +
					"f747656c8e1eae760090fe862f14ce3118e92af3f0d545f458c6868b74aa1fa0:1");
			return "signed";
		}

		public override string BroadcastSignedTxIntoDashNetwork(string signedTx, bool useInstantSend)
			=> "useTestnetForRealTx";
	}
}