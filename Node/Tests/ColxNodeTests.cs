using System;
using System.Collections.Generic;
using System.Globalization;
using BitcoinLib.Services.Coins.Colx;
using MyDashWallet.Node.Tests.Mocks;
using NUnit.Framework;

namespace MyDashWallet.Node.Tests
{
	public class ColxNodeTests
	{
		[Test]
		public void GetTotalBalance()
		{
			var service = new ColxService("http://localhost:51573", "MyColxWallet", "itnosaoed39i",
				"itnosaoed39i", 60);

			Console.WriteLine("Colx node balance: " + service.GetBalance("", 0, false));
			Assert.That(service.GetBalance("", 0, false), Is.GreaterThan(0m));
		}
	}
}