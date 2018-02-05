function goToSendPanel(successfullyConnectedMessage) {
	window.clearInterval(autoConnect);
	$("#main-panel").hide();
	$("#send-panel").show();
	if (ledgerDash || trezorDash)
		$("#hardware-wallets-panel").hide();
	$("#title").text("Send Dash");
	$("#response").show().css("color", "black").html(successfullyConnectedMessage);
	$("#main-page-title").text("Close Wallet");
}

function showNumber(amount, decimals) {
	var result;
	if (decimals === 3) {
		result = parseFloat(Math.round(amount * 1000) / 1000).toFixed(decimals);
	}
	else if (decimals === 4) {
		result = parseFloat(Math.round(amount * 10000) / 10000).toFixed(decimals);
		// If we have more than 1 leading digits before the . remove the last digit after the dot
		if (result.length > 6)
			result = result.substring(0, result.length - 1);
	}
	else if (decimals === 5) {
		result = parseFloat(Math.round(amount * 100000) / 100000).toFixed(decimals);
		// If we have more than 1 leading digits before the . remove the last digit after the dot
		if (result.length > 7)
			result = result.substring(0, result.length - 1);
	}
	else if (decimals === 6)
		result = parseFloat(Math.round(amount * 1000000) / 1000000).toFixed(decimals);
	else if (decimals === 7)
		result = parseFloat(Math.round(amount * 10000000) / 10000000).toFixed(decimals);
	else if (decimals === 8)
		result = parseFloat(Math.round(amount * 100000000) / 100000000).toFixed(decimals);
	else
		result = parseFloat(amount).toFixed(decimals);
	// Always cut off the last bunch of zeros (except if we requested 2 decimals for currencies)
	if (decimals > 2)
		for (var i = 0; i < 9; i++) {
			var isDot = result.endsWith('.');
			if (result.endsWith('0') || isDot) {
				result = result.substring(0, result.length - 1);
				if (isDot)
					break;
			} else
				break;
		}
	if (result === "")
		return 0;
	return result;
}

// Helper to show amount in DASH if it is above 0.1 DASH, otherwise show it in mDASH. Will always
// show the exact number up to 8 (for DASH) or 5 (for mDASH) decimals to represent all duffs!
function showDashOrMDashNumber(amount) {
	if (amount > 0.1)
		return showNumber(amount, 8) + " DASH";
	return showNumber(amount * 1000, 5) + " mDASH";
}

var ledgerDash;
//https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
var addressBalances = {};
var autoBalanceCheck;

function isValidDashAddress(address) {
	return address && address.length >= 34 && (address[0] === 'X' || address[0] === 'x');
}

function updateLocalStorageBalances() {
	var totalAmount = 0;
	var cachedText = "";
	$.each(addressBalances,
		function (key, amount) {
			if (isValidDashAddress(key)) {
				totalAmount += amount;
				cachedText += key + "|" + amount + "|";
			}
		});
	localStorage.setItem('addressBalances', cachedText);
	//console.log("New total amount: " + totalAmount);
	return totalAmount;
}

//bitcore.Transaction.DUST_AMOUNT, the minimum we should ever have in an address or tx is 1000duffs
var DUST_AMOUNT = 1000;
var DUST_AMOUNT_IN_DASH = 0.00001;
// Loops through all known Dash addresses and checks the balance and sums up to total amount we got
function balanceCheck() {
	//keep displaying: document.getElementById("refreshing-amount-timeout").style.display = "none";
	$.each(addressBalances,
		function (addressToCheck, oldBalance) {
			if (isValidDashAddress(addressToCheck)) {
				$.get("https://explorer.dash.org/chain/Dash/q/addressbalance/" + addressToCheck,
					function (data, status) {
						if (status === "success" && data !== "ERROR: address invalid" && oldBalance !== parseFloat(data)) {
							console.log("Updating balance of " + addressToCheck + ": " + data);
							addressBalances[addressToCheck] = parseFloat(data);
							if (addressBalances[addressToCheck] < DUST_AMOUNT_IN_DASH)
								addressBalances[addressToCheck] = 0;
							updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses();
						}
					});
			}
		});
}

var balanceCheckTime = 5;

function tryBalanceCheck() {
	document.getElementById("balance-check-time").innerHTML = balanceCheckTime + "s";
	if (balanceCheckTime === 0)
		balanceCheck();
	//always show: document.getElementById("refreshing-amount-timeout").style.display = balanceCheckTime === 0 ? "none" : "block";
	document.getElementById("refreshing-amount-timeout").style.display = "block";
	balanceCheckTime -= 1;
	if (balanceCheckTime === -1)
		balanceCheckTime = 10;
}

function updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses() {
	var totalAmount = updateLocalStorageBalances();
	document.getElementById("totalAmountDash").innerHTML = showNumber(totalAmount, 8);
	document.getElementById("totalAmountMDash").innerHTML = showNumber(totalAmount * 1000, 5);
// ReSharper disable UseOfImplicitGlobalInFunctionScope
	document.getElementById("totalAmountUsd").innerHTML = showNumber(totalAmount * usdRate, 2);
	document.getElementById("totalAmountEur").innerHTML = showNumber(totalAmount * eurRate, 2);
	document.getElementById("totalAmountGbp").innerHTML = showNumber(totalAmount * gbpRate, 2);
	generateReceivingAddressList();
}

function getFreshestAddress() {
	if (trezorDash)
		return trezorDash.freshAddress;
	var freshestAddress = "";
	$.each(addressBalances, function (address) { freshestAddress = address; });
	return freshestAddress;
}

function generateReceivingAddressList() {
	var list = $("#addressList");
	list.empty();
	var freshestAddress = getFreshestAddress();
	$.each(addressBalances,
		function (address, balance) {
			var qrImg = "//chart.googleapis.com/chart?cht=qr&chl=dash:" + address + "&choe=UTF-8&chs=140x140&chld=L|0";
			$("<li><a href='https://explorer.dash.org/address/" +
				address +
				"' target='_blank' rel='noopener noreferrer'>" +
				(address === freshestAddress
					? "<img width='140' height='140' src='" +
					qrImg +
					"' title='Your freshest Dash Address should be used for receiving Dash, you will get a new one once this has been used!' /><br/>"
					: "") +
				address +
				"</a><div class='address-amount' onclick='setAmountToSend("+balance+")'>" +
				showDashOrMDashNumber(balance) + "</div></li>").prependTo(list);
		});
}

function setAddressAndLookForLastUsedHdWalletAddress(firstAddress) {
	// Check if we were on this address the last time too, then we can use cached data
	var compressedCachedAddressBalances = localStorage.getItem('addressBalances');
	addressBalances = {};
	// Was cached and still on the same wallet as last time? Then restore all known address balances
	if (compressedCachedAddressBalances) {
		var parts = compressedCachedAddressBalances.split('|');
		if (firstAddress === parts[0]) {
			for (var i = 0; i < parts.length / 2; i++)
				if (parts[i * 2].length > 0)
					addressBalances[parts[i * 2]] = parseFloat(parts[i * 2 + 1]);
		}
	}
	if (!addressBalances[firstAddress]) {
		addressBalances[firstAddress] = 0;
		generateReceivingAddressList();
	}
	if (!autoBalanceCheck) {
		updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses();
		balanceCheck();
		autoBalanceCheck = window.setInterval(tryBalanceCheck, 1000);
	}
	// Querying addresses is very slow on the ledger, go through them in packs of 3 if we got any
	// action on our first address (if not, keep that single one with 0 dash so far).
	// And skip anything we have in our addressBalances list already, keep updating the cache.
	//console.log("got already " + getNumberOfAddresses() + " addresses");
	updateBalanceIfAddressIsUsed(getFreshestAddress());
}

function getNumberOfAddresses() {
	var num = 0;
	$.each(addressBalances, () => num++);
	return num;
}

function updateBalanceIfAddressIsUsed(newAddress) {
	$.get("https://explorer.dash.org/chain/Dash/q/getreceivedbyaddress/" + newAddress,
		function (data, status) {
			if (status === "success" && data !== "ERROR: address invalid") {
				if (!addressBalances[newAddress]) {
					//console.log("Found new Dash Address: " + newAddress);
					addressBalances[newAddress] = 0;
					// Update storage to not query this next time if this is in fact the newest empty address
					updateLocalStorageBalances();
					generateReceivingAddressList();
				}
				// If there was ever anything sent to this address, continue checking for more
				if (parseFloat(data) > 0)
					checkNextLedgerAddress();
			}
		});
}

function checkNextLedgerAddress() {
	//console.log("checkNextLedgerAddress got already " + getNumberOfAddresses() + " addresses");
	ledgerDash.getWalletPublicKey_async("44'/5'/0'/0/" + getNumberOfAddresses()).then(
		function (result) {
			updateBalanceIfAddressIsUsed(result.bitcoinAddress);
		});
	// Algorithm is as follows:
	// 1. Get the next Dash receiving addresses (will take about 300ms)
	// 2. Check them one-by-one via https://explorer.dash.org/chain/Dash/q/getreceivedbyaddress/<address>
	// 3. If there was ever received something, add and continue
	// 4. Abort if this address has not received anything yet (still add it as last fresh one)
	// 5. If address had dash received, continue with the next dash address to check
}

var autoConnectTime = 0;
function tryAutoConnect() {
	$("#allowAutoConnectLedger").prop('checked', true);
	document.getElementById("auto-connect-time").innerHTML = " in " + autoConnectTime + "s";
	//console.log("toggleAutoConnect " + autoConnectTime);
	if (autoConnectTime === 0) {
		unlockLedger(false);
		//unused, must be done manually: unlockTrezor(false);
	}
	autoConnectTime -= 1;
	if (autoConnectTime === -1)
		autoConnectTime = 5;
}

var autoConnect;
if (localStorage.getItem('autoConnectLedger'))
	enableAutoConnect();

function toggleAutoConnectLedger() {
	if ($("#allowAutoConnectLedger").is(':checked'))
		enableAutoConnect();
	else
		disableAutoConnect();
}

function enableAutoConnect() {
	autoConnect = window.setInterval(tryAutoConnect, 1000);
	$("#autoConnectSpinner").show();
}

function disableAutoConnect() {
	if (autoConnect) {
		window.clearInterval(autoConnect);
		$("#autoConnectSpinner").hide();
		document.getElementById("auto-connect-time").innerHTML = "";
		autoConnect = undefined;
		localStorage.removeItem('autoConnectLedger');
	}
}

function unlockLedger(showResponse) {
	if (showResponse) {
		document.getElementById("response").style.display = "block";
		document.getElementById("response").style.color = "black";
		document.getElementById("response").innerHTML =
			"Connecting to Ledger Hardware Wallet ..<br />Make sure it is unlocked, in the DASH app and browser settings are enabled!";
	}
	if (!ledgerDash && !trezorDash)
		ledger.comm_u2f.create_async(90).then(function (comm) {
			ledgerDash = new ledger.btc(comm);
			//Retrieve public key with BIP 32 path, see https://www.ledgerwallet.com/api/demo.html
			ledgerDash.getWalletPublicKey_async("44'/5'/0'/0/0").then(
				function (result) {
					try {
						// Remember to automatically connect to ledger next time we open the website
						localStorage.setItem('autoConnectLedger', true);
						goToSendPanel(
							"Successfully connected to Ledger Hardware Wallet, you can now confirm all features on this site with your device.");
						setAddressAndLookForLastUsedHdWalletAddress(result.bitcoinAddress);
					} catch (e) {
						document.getElementById("response").innerHTML = e.stack ? e.stack : e;
					}
				}).catch(
				function (error) {
					ledgerDash = undefined;
					if (showResponse)
						document.getElementById("response").innerHTML =
							"Error connecting to Ledger Hardware Wallet: " + getLedgerErrorText(error) + "<br />" +
							"Please check the <a href='/AboutLedgerHardwareWallet'>Ledger Hardware Wallet Guide</a> for more help.";
				});
		});
}

function getLedgerErrorText(error) {
	//https://github.com/kvhnuke/etherwallet/issues/336
	if (error === "Invalid status 6985")
		return "User denied the transaction on the hardware device (invalid tx status 6985), aborting!";
	else if (error === "Invalid status 6a80")
		return "Invalid status 6a80: Data is not in a correct format and was rejected by the hardware device.";
	var errorText = error.errorCode ? "Unknown error, error code=" + error.errorCode : error;
	if (errorText === "No device found")
		errorText = "No device found. Make sure to connect a device and unlock it.";
	else if (error === "Invalid status 6804")
		errorText =
			"Security Exception. This means an invalid BIP32 path was provided. Do you have hardening in the right places?";
	else if (errorText === "Invalid status 6982")
		errorText = "Device timed out or is locked again. Please re-enter pin on the device.<br/>";
	//'OK': 0,
	//'OTHER_ERROR': 1,
	//'BAD_REQUEST': 2,
	//'CONFIGURATION_UNSUPPORTED': 3,
	//'DEVICE_INELIGIBLE': 4,
	//'TIMEOUT': 5
	else if (error.errorCode === 2)
		errorText =
			"Error code = 2. Not running in secure context (must be https), unable to connect to Ledger.<br/>https://github.com/LedgerHQ/ledger-node-js-api/issues/32";
	else if (error.errorCode === 4)
		errorText =
			"Error code = 4. Dash app is not open on Ledger. Please open the Dash app with <b>Browser support</b> enabled to continue.";
	else if (error.errorCode === 5)
		errorText = "Error code = 5 (timed out). Unable to receive an answer from Ledger Hardware. Please check the screen on your device and try again.<br/>" +
			"Is your Ledger unlocked and is the <b>Dash</b> app open with <b>Browser support</b> enabled in Settings?";
	else if (error.errorCode === 400)
		errorText =
			"Error code = 400. Please update your hardware device, seems like an error occurred while updating. https://ledger.zendesk.com/hc/en-us/articles/115005171225-Error-Code-400";
	return errorText;
}

var trezorDash;
function unlockTrezor(showResponse) {
	disableAutoConnect();
	if (showResponse) {
		document.getElementById("response").style.display = "block";
		document.getElementById("response").innerHTML =
			"Connecting to TREZOR Hardware Wallet .. Please follow the instructions in the popup window!";
	}
	TrezorConnect.setCurrency("Dash");
	TrezorConnect.setCurrencyUnits("mDASH");
	TrezorConnect.getAccountInfo("m/44'/5'/0'", function (response) {
		if (response.success) {
			trezorDash = response;
			/*works
			console.log('Account ID: ', response.id);
			console.log('Account path: ', response.path);
			console.log('Serialized account path: ', response.serializedPath);
			console.log('Xpub', response.xpub);
			console.log('Fresh address (first unused address): ', response.freshAddress);
			console.log('Fresh address ID: ', response.freshAddressId);
			console.log('Fresh address path: ', response.freshAddressPath);
			console.log('Serialized fresh address path: ', response.serializedFreshAddressPath);
			console.log('Balance in satoshis (including unconfirmed):', response.balance);
			console.log('Balance in satoshis (only confirmed):', response.confirmed);
			*/
			goToSendPanel(
				"Successfully connected to TREZOR Hardware Wallet, you can now confirm all features on this site with your device.");
			addressBalances = { addressIndex: response.freshAddressId, address: response.freshAddress };
			var totalAmount = response.balance / 100000000.0;
			document.getElementById("totalAmountDash").innerHTML = showNumber(totalAmount, 8);
			document.getElementById("totalAmountMDash").innerHTML = showNumber(totalAmount * 1000, 5);
			document.getElementById("totalAmountUsd").innerHTML = showNumber(totalAmount * usdRate, 2);
			document.getElementById("totalAmountEur").innerHTML = showNumber(totalAmount * eurRate, 2);
			document.getElementById("totalAmountGbp").innerHTML = showNumber(totalAmount * gbpRate, 2);
			var list = $("#addressList");
			list.empty();
			var address = response.freshAddress;
			var qrImg = "//chart.googleapis.com/chart?cht=qr&chl=dash:" + address + "&choe=UTF-8&chs=140x140&chld=L|0";
			$("<li><a href='https://explorer.dash.org/address/" +
				address + "' target='_blank' rel='noopener noreferrer'>" +
				"<img width='140' height='140' src='" + qrImg +
					"' title='Your freshest Dash Address should be used for receiving Dash, you will get a new one once this has been used!' /><br/>" + address +
				"</a><div class='address-amount' onclick='setAmountToSend("+totalAmount+")'>" +
				showDashOrMDashNumber(totalAmount) + "</div></li>").prependTo(list);
			//allow anyway: Currently not supported on TREZOR $("#useInstantSend").disable()
		} else {
			document.getElementById("response").innerHTML = "Error getting TREZOR account: "+ response.error;
		}
	});
}

function setTotalAmountToSend() {
	setAmountToSend(parseFloat($("#totalAmountDash").text()));
}

function setAmountToSend(amount) {
	var sendCurrency = $("#selectedSendCurrency").text();
	// We have to do the inverse as below to convert from Dash to the selected format!
	if (sendCurrency === "mDASH")
		amount *= 1000;
	if (sendCurrency === "USD")
		amount *= usdRate;
	if (sendCurrency === "EUR")
		amount *= eurRate;
	if (sendCurrency === "GBP")
		amount *= gbpRate;
	$("#amount").val(amount);
	updateAmountInfo();
}

var amountToSend = 0.001;
function getPrivateSendNumberOfInputsBasedOnAmount() {
	// Everything below 10mDASH will be send in one transaction.
	// Amounts are: 10mDASH, 100mDASH, 1 DASH, 10 DASH
	// https://dashpay.atlassian.net/wiki/spaces/DOC/pages/1146924/PrivateSend
	if (amountToSend <= 0.01)
		return 1;
	var numberOfPrivateSendInputsNeeded = 1;
	while (amountToSend > 10) {
		numberOfPrivateSendInputsNeeded++;
		amountToSend -= 10;
	}
	while (amountToSend > 1) {
		numberOfPrivateSendInputsNeeded++;
		amountToSend -= 1;
	}
	while (amountToSend > 0.1) {
		numberOfPrivateSendInputsNeeded++;
		amountToSend -= 0.1;
	}
	while (amountToSend > 0.01) {
		numberOfPrivateSendInputsNeeded++;
		amountToSend -= 0.01;
	}
	return numberOfPrivateSendInputsNeeded;
}

var lastKnownNumberOfInputs = 1;
function updateTxFee(numberOfInputs) {
	if (numberOfInputs <= 0) {
		// Try to figure out how many inputs we would need if we have multiple addresses
		numberOfInputs = 0;
		var amountToCheck = amountToSend;
		$.each(addressBalances, function(key, amount) {
			if (amount > 0 && amountToCheck > 0.00000001) {
				numberOfInputs++;
				amountToCheck -= amount;
			}
		});
		if (numberOfInputs === 0)
			numberOfInputs = lastKnownNumberOfInputs;
	}
	lastKnownNumberOfInputs = numberOfInputs;
	// mDASH tx fee with 1 duff/byte with default 226 byte tx for 1 input, 374 for 2 inputs (78+148*
	// inputs). All this is recalculated below and on the server side once number of inputs is known.
	var txFee = 0.00078 + 0.00148 * numberOfInputs;
	if ($("#useInstantSend").is(':checked'))
		txFee = 0.1 * numberOfInputs;
	// PrivateSend number of needed inputs depends on the amount, not on the inputs (fee for that
	// is already calculated above). Details on the /AboutPrivateSend help page
	if ($("#usePrivateSend").is(':checked'))
		txFee += 0.1 + 0.01 * getPrivateSendNumberOfInputsBasedOnAmount();
	$("#txFeeMDash").text(showNumber(txFee, 5));
	$("#txFeeUsd").text(showNumber(txFee * usdRate / 1000, 4));
	if (amountToSend < DUST_AMOUNT_IN_DASH || amountToSend > parseFloat($("#totalAmountDash").text()) ||
		$("#usePrivateSend").is(':checked') && amountToSend < MinimumForPrivateSend) {
		$("#generateButton").css("backgroundColor", "gray").attr("disabled", "disabled");
		amountToSend = 0;
	}
}
updateTxFee(1);

function setSendCurrency(newSendCurrency) {
	$("#selectedSendCurrency").text(newSendCurrency);
	updateAmountInfo();
}

// Doesn't make much sense to send less than 1 mDASH for PrivateSend (as fees will be >10-20%)
var MinimumForPrivateSend = 0.001;
function updateAmountInfo() {
	var amount = parseFloat($("#amount").val());
	var amountIsValid = amount > 0;
	if (isNaN(amount))
		amount = 1;
	var sendCurrency = $("#selectedSendCurrency").text();
	if (sendCurrency === "mDASH")
		amount /= 1000;
	if (sendCurrency === "USD")
		amount /= usdRate;
	if (sendCurrency === "EUR")
		amount /= eurRate;
	if (sendCurrency === "GBP")
		amount /= gbpRate;
	amountToSend = amount;
	if (amountToSend < DUST_AMOUNT_IN_DASH || amountToSend > parseFloat($("#totalAmountDash").text()) ||
		$("#usePrivateSend").is(':checked') && amountToSend < MinimumForPrivateSend)
		amountIsValid = false;
	//not longer used or shown: var btcValue = showNumber(amountToSend * btcRate, 6);
	$("#amount-info-box").text(
		showNumber(amountToSend * 1000, 5) + " mDASH " +
		"= " + showNumber(amountToSend, 8) + " DASH " +
		"= $" + showNumber(amountToSend * usdRate, 2) + " " +
		"= €" + showNumber(amountToSend * eurRate, 2) + " " +
		"= £" + showNumber(amountToSend * gbpRate, 2) +
		" (1 DASH = " + btcRate + " BTC)");
	updateTxFee(0);
	if (amountIsValid && isValidDashAddress($("#toAddress").val())) {
		$("#generateButton").css("backgroundColor", "#1c75bc").removeAttr("disabled");
	} else {
		$("#generateButton").css("backgroundColor", "gray").attr("disabled", "disabled");
		amountToSend = 0;
	}
}
updateAmountInfo();

function copyToClipboard(element) {
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val($(element).text() === "" ? element : $(element).text()).select();
	document.execCommand("copy");
	$temp.remove();
	if (element === "XoASepVfo1cegWp52HS9gbcKuarLyqxsKT" && $("#toAddress").val() === "") {
		$("#toAddress").val(element);
		updateAmountInfo();
	}
}

function generateTransaction() {
	$("#generateButton").css("background-color", "gray").attr("disabled", "disabled");
	if (amountToSend === 0) {
		$("#transactionPanel").hide();
		$("#resultPanel").css("color", "red")
			.text(($("#usePrivateSend").is(':checked') && parseFloat($("#amount").val()) < 1 ?
				"PrivateSend transactions should be done with at least 1mDASH! " : "")+
				"Please enter an amount you have and a valid address to send to. Unable to create transaction!");
		return;
	}
	// Okay, we have all data ready, pick the oldest addresses until we have the required amount and
	// find all unspend outputs and send it all to the MyDashWallet server to prepare the raw
	// transaction to sign. Doing this locally is possible too, but too much work right now.
	$("#resultPanel").css("color","black").text("Waiting for raw transaction to be generated ...");
	if (trezorDash)
		generateTrezorSignedTx();
	else
		addNextAddressWithUnspendFundsToRawTx(getAddressesWithUnspendFunds(), 0, getFreshestAddress(), 0, [], [], [], "");
}

function generateTrezorSignedTx() {
	//all this get address/utxo stuff is not required on Trezor, we can simply use (however without InstantSend support, maybe the user can select 10000duff fee (10mDASH) to allow InstantSend):
	var toAddress = $("#toAddress").val();
	var txFee = parseFloat($("#txFeeMDash").text()) / 1000;
	var outputs = [
		{
			address: toAddress,
			amount: Math.round(amountToSend * 100000000) //in duff
		}
	];
	$("#transactionPanel").show();
	$("#txDetailsPanel").hide();
	// InstantSend is not really supported on TREZOR, but if we set the fee correctly and send with
	// our MyDashWallet service, it still will work out of the box. PrivateSend is deferred anyway.
	var useInstantSend = $("#useInstantSend").is(':checked');
	var usePrivateSend = $("#usePrivateSend").is(':checked');
	if (usePrivateSend) {
		// PrivateSend needs to generate the raw tx just to get the new privatesend address
		var utxosTextWithOutputIndices = "0";
		var remainingDash = 0;
		var remainingAddress = getFreshestAddress();
		$.getJSON("/GenerateRawTx?utxos="+utxosTextWithOutputIndices+"&amountToAddress="+showNumber(amountToSend, 8)+"|"+toAddress+"&remainingAmountToAddress="+showNumber(remainingDash, 8)+"|"+remainingAddress+"&instantSend="+useInstantSend+"&privateSend="+usePrivateSend).done(
			function (data) {
				txFee = data["usedSendTxFee"];
				var rawTxList = showRawTxPanel(toAddress, txFee,
					data["redirectedPrivateSendAddress"],
					data["redirectedPrivateSendAmount"]);
				outputs = [
					{
						address: data["redirectedPrivateSendAddress"],
						amount: Math.round(data["redirectedPrivateSendAmount"] * 100000000) //in duff
					}
				];
				$("<li>Please confirm this PrivateSend transaction on your TREZOR hardware device (make sure the PrivateSend target address "+data["redirectedPrivateSendAddress"]+" matches what you see on the screen), use <b>economy</b> fees!</li>").appendTo(rawTxList);
				TrezorConnect.composeAndSignTx(outputs, function (result) {
					if (result.success) {
						$("#transactionPanel").hide();
						$("#txDetailsPanel").show();
						$("#txDetailsPanel").html("Click to show signed transaction details for techies.");
						signedTx = result.serialized_tx;
						//console.log("signed tx %O", signedTx);
						$("#resultPanel").css("color", "black").text("Sending signed transaction to the Dash network ..");
						$.get("/SendSignedTx?signedTx=" + signedTx + "&instantSend=" + useInstantSend).done(
							function (finalTx) {
								$("#resultPanel").css("color", "orange").html(
									"Successfully signed transaction and broadcasted it to the Dash network. "+
									"You can check the transaction status in a few minutes here: <a href='https://explorer.dash.org/tx/" + finalTx+"' target='_blank' rel='noopener noreferrer'>"+finalTx+"</a>"+(usePrivateSend?getPrivateSendFinalHelp() : ""));
							}).fail(function (jqxhr) {
								$("#resultPanel").css("color", "red").text("Server Error: " + jqxhr.responseText);
							});
					} else {
						$("#resultPanel").css("color","red").text("Error signing with TREZOR: " + result.error+
							(result.error === "Amount is to low" ? " (Sorry, TREZOR currently only allows transactions above 5000 duffs, use more than 0.05 mDASH)":""));
					}
				});
			}).fail(function (jqxhr) {
				$("#resultPanel").css("color", "red").text("Server Error: " + jqxhr.responseText);
			});
		return;
	}
	var rawTxList = showRawTxPanel(toAddress, txFee, toAddress, 1);
	if (useInstantSend)
		$("<li>Please confirm this transaction on your TREZOR hardware device. Since you have selected InstantSend, it will only go through if you manually set the fee to 10000 duffs (0.1mDASH)!</li>").appendTo(rawTxList);
	else
		$("<li>Please confirm this transaction on your TREZOR hardware device, use <b>economy</b> fees!</li>").appendTo(rawTxList);
	TrezorConnect.composeAndSignTx(outputs, function (result) {
		if (result.success) {
			$("#transactionPanel").hide();
			$("#txDetailsPanel").show();
			$("#txDetailsPanel").html("Click to show signed transaction details for techies.");
			signedTx = result.serialized_tx;
			//console.log("signed tx %O", signedTx);
			$("#resultPanel").css("color", "black").text("Sending signed transaction to the Dash network ..");
			$.get("/SendSignedTx?signedTx=" + signedTx + "&instantSend=" + useInstantSend).done(
				function (finalTx) {
					$("#resultPanel").css("color", "orange").html(
						"Successfully signed transaction and broadcasted it to the Dash network. "+
						(useInstantSend ? "You used InstantSend, the Dash will appear immediately at the target wallet. " : "")+
						"You can check the transaction status in a few minutes here: <a href='https://explorer.dash.org/tx/" + finalTx+"' target='_blank' rel='noopener noreferrer'>"+finalTx+"</a>");
				}).fail(function (jqxhr) {
					$("#resultPanel").css("color", "red").text("Server Error: " + jqxhr.responseText);
				});
		} else {
			$("#resultPanel").css("color","red").text("Error signing with TREZOR: " + result.error+
				(result.error === "Amount is to low" ? " (Sorry, TREZOR currently only allows transactions above 5000 duffs, use more than 0.05 mDASH)":""));
		}
	});
}

var rawTx = "";
var signedTx = "";
function addNextAddressWithUnspendFundsToRawTx(addressesWithUnspendInputs, addressesWithUnspendInputsIndex, remainingAddress, txAmountTotal, txToUse, txOutputIndexToUse, txAddressPathIndices, inputListText) {
	if (addressesWithUnspendInputsIndex >= addressesWithUnspendInputs.length) {
		$("#resultPanel").css("color", "red")
			.text("Failed to find more addresses with funds for creating transaction. Unable to continue!");
		return;
	}
	//Find utxo, via undocumented https://explorer.dash.org/chain/Dash/unspent/<address>
	//another option: https://github.com/UdjinM6/insight-api-dash#unspent-outputs
	$.getJSON("https://explorer.dash.org/chain/Dash/unspent/" +
		addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address,
		function (data, status) {
			var address = addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address;
			if (status !== "success" || data === "Error getting unspent outputs" || !data["unspent_outputs"]) {
				$("#resultPanel").css("color", "red")
					.text("Failed to find any utxo (unspend transaction output) for " + address + ". Was it just spend elsewhere? Unable to create transaction, please refresh page!");
				return;
			}
			//Return format:
			//{ 
			//"unspent_outputs": [
			//	{
			//		"block_number": 732794,
			//		"script": "76a91403d6fdba65010ec83202ec142a2807d9019b3e6d88ac",
			//		"tx_hash": "dcffdac068fef91f81b9eacd3b2719405d9eacc0353bc00c7f1bc3de94f49c84",
			//		"tx_output_n": 1,
			//		"value": 100000000,
			//		"value_hex": "5f5e100"
			//	}
			// ]
			//}
			var utxos = data["unspent_outputs"];
			var thisAddressAmountToUse = 0;
			var txFee = parseFloat($("#txFeeMDash").text()) / 1000;
			var totalAmountNeeded = amountToSend + txFee;
			var maxAmountPossible = parseFloat($("#totalAmountDash").text());
			// If we send everything, subtract txFee so we can actually send everything
			if (totalAmountNeeded >= maxAmountPossible)
				totalAmountNeeded = maxAmountPossible;
			for (var i = 0; i < utxos.length; i++) {
				var amount = utxos[i]["value"] / 100000000.0;
				if (amount >= DUST_AMOUNT_IN_DASH) {
					txToUse.push(utxos[i]["tx_hash"]);
					txOutputIndexToUse.push(utxos[i]["tx_output_n"]);
					txAddressPathIndices.push(addressesWithUnspendInputs[addressesWithUnspendInputsIndex].addressIndex);
					thisAddressAmountToUse += amount;
					txAmountTotal += amount;
					if (txAmountTotal >= totalAmountNeeded)
						break;
				}
			}
			inputListText += "<li><a href='https://explorer.dash.org/address/" + address + "' target='_blank' rel='noopener noreferrer'><b>" + address + "</b></a> (-" + showDashOrMDashNumber(thisAddressAmountToUse) + ")</li>";
			if (txAmountTotal >= totalAmountNeeded) {
				// Recalculate txFee like code above, now we know the actual number of inputs needed
				updateTxFee(txToUse.length);
				txFee = parseFloat($("#txFeeMDash").text()) / 1000;
				totalAmountNeeded = amountToSend + txFee;
				if (totalAmountNeeded >= maxAmountPossible)
					totalAmountNeeded = maxAmountPossible;
				// Extra check if we are still have enough inputs to what we need
				if (txAmountTotal >= totalAmountNeeded) {
					// We have all the inputs we need, we can now create the raw tx
					$("#transactionPanel").show();
					//debug: inputListText += "<li>Done, got all inputs we need:</li>";
					var utxosTextWithOutputIndices = "";
					for (var index = 0; index < txToUse.length; index++) {
						//debug: inputListText += "<li>"+txToUse[index]+", "+txOutputIndexToUse[index]+"</li>";
						utxosTextWithOutputIndices += txToUse[index] + "|" + txOutputIndexToUse[index] + "|";
					}
					var toAddress = $("#toAddress").val();
					var useInstantSend = $("#useInstantSend").is(':checked');
					var usePrivateSend = $("#usePrivateSend").is(':checked');
					$("#rawTransactionData").empty();
					$("#txDetailsPanel").show();
					$("#txDetailsPanel").html("Click to show transaction details for techies.");
					// Finish raw tx to sign, one final check if everything is in order will be done on server!
					if (!ledgerDash)
						$("#signButton").show();
					// Update amountToSend in case we had to reduce it a bit to allow for the txFee
					amountToSend = totalAmountNeeded - txFee;
					var remainingDash = txAmountTotal - totalAmountNeeded;
					$.getJSON("/GenerateRawTx?utxos="+utxosTextWithOutputIndices+"&amountToAddress="+showNumber(amountToSend, 8)+"|"+toAddress+"&remainingAmountToAddress="+showNumber(remainingDash, 8)+"|"+remainingAddress+"&instantSend="+useInstantSend+"&privateSend="+usePrivateSend).done(
					function (data) {
						var txHashes = data["txHashes"];
						rawTx = data["rawTx"];
						txFee = data["usedSendTxFee"];
						//console.log("txHashes: %O", txHashes);
						//console.log("rawTx: %O", rawTx);
						var rawTxList = showRawTxPanel(toAddress, txFee,
							data["redirectedPrivateSendAddress"],
							data["redirectedPrivateSendAmount"]);
						$("<li>Using these inputs from your addresses for the required <b>" + showDashOrMDashNumber(totalAmountNeeded) + "</b> (including fees):<ol>" + inputListText + "</ol></li>").appendTo(rawTxList);
						if (remainingDash > 0)
							$("<li>The remaining "+showDashOrMDashNumber(remainingDash)+" will be send to your own receiving address: <a href='https://explorer.dash.org/address/" + remainingAddress + "' target='_blank' rel='noopener noreferrer'><b>" + remainingAddress + "</b></a></li>").appendTo(rawTxList);
						if (ledgerDash)
							signRawTxOnLedgerHardware(txHashes, rawTx, txOutputIndexToUse, txAddressPathIndices);
						else
							signRawTxWithKeystore(txHashes, txOutputIndexToUse, rawTx, txFee);
					}).fail(function (jqxhr) {
						$("#resultPanel").css("color", "red").text("Server Error: " + jqxhr.responseText);
					});
					return;
				}
			}
			// Not done yet, get next address
			addressesWithUnspendInputsIndex++;
			if (addressesWithUnspendInputsIndex < addressesWithUnspendInputs.length)
				addNextAddressWithUnspendFundsToRawTx(addressesWithUnspendInputs,
					addressesWithUnspendInputsIndex,
					remainingAddress,
					txAmountTotal,
					txToUse,
					txOutputIndexToUse,
					txAddressPathIndices,
					inputListText);
			else {
				$("#transactionPanel").hide();
				$("#resultPanel").css("color", "red").text("Insufficient funds, cannot send " +
					totalAmountNeeded + " Dash (including tx fee), you only have " + maxAmountPossible +
					" Dash. If you have Dash incoming, please wait until they are fully confirmed and show up on your account balance here. Unable to create transaction!");
			}
		});
}

function signRawTxOnLedgerHardware(txHashes, rawTx, txOutputIndexToUse, txAddressPathIndices) {
	var txs = [];
	var addressPaths = [];
	for (var i = 0; i < txHashes.length; i++) {
		var parsedTx = ledgerDash.splitTransaction(txHashes[i]);
		//console.log("parsed tx " + i + ": %O", parsedTx);
		if (!parsedTx.inputs || parsedTx.inputs.length === 0) {
			$("#resultPanel").css("color", "red")
				.text("Empty broken raw tx for input " + i + ", unable to continue");
			return;
		}
		txs.push([parsedTx, txOutputIndexToUse[i]]);
		if (!txAddressPathIndices[i]) {
			$("#resultPanel").css("color", "red")
				.text("Empty broken address path index for input " + i + ", unable to continue");
			return;
		}
		addressPaths.push("44'/5'/0'/0/" + txAddressPathIndices[i]);
	}
	var parsedRawtx = ledgerDash.splitTransaction(rawTx);
	//console.log("parsedRawtx: %O", parsedRawtx);
	if (!parsedRawtx || parsedRawtx.outputs.length === 0) {
		$("#resultPanel").css("color", "red").text("Empty broken raw tx outputs, unable to continue");
		return;
	}
	var outputScript = ledgerDash.serializeTransactionOutputs(parsedRawtx).toString('hex');
	//console.log("outputScript: %O", outputScript);
	if (!outputScript) {
		$("#resultPanel").css("color", "red").text("Empty broken raw tx output script, unable to continue");
		return;
	}
	$("#resultPanel").css("color", "orange").html("Sign the transaction <b>output#1</b> and <b>fee</b> with your hardware device to send it to the Dash network!");
	// Sign on hardware (specifying the change address gets rid of change output confirmation)
	// Still requires 2 confirmation, first the external output address and then the transaction+fee
	var remainingAddressPath = "44'/5'/0'/0/" + (getNumberOfAddresses() - 1);
	//console.log("remainingAddressPath: "+remainingAddressPath);
	ledgerDash.EXTENSION_TIMEOUT_SEC = 90;
	ledgerDash.createPaymentTransactionNew_async(txs, addressPaths, remainingAddressPath,
		outputScript).then(
		function (finalSignedTx) {
			signedTx = finalSignedTx;
			//console.log("signed tx %O", signedTx);
			signAndSendTransaction();
		}).catch(function (error) {
			$("#resultPanel").css("color", "red").html(getLedgerErrorText(error));
		});
}

function signRawTxWithKeystore(txHashes, txOutputIndexToUse, rawTx, txFee) {
	//console.log("rawTx %O", rawTx);
	var txFeeInDuffs = Math.round(txFee * 100000000);
	//console.log("txFeeInDuffs %O", txFeeInDuffs);
	signedTx = window.signRawTx(txHashes, txOutputIndexToUse, rawTx, txFeeInDuffs, CryptoJS.AES.decrypt(dashKeystoreWallet.d, dashKeystoreWallet.s).toString(CryptoJS.enc.Utf8));
	//console.log("signed tx %O", signedTx);
	if (signedTx.startsWith("Error")) {
		$("#resultPanel").css("color", "red").text("Signing Transaction failed. " + signedTx);
		return;
	}
	$("#signButton").css("backgroundColor", "#1c75bc").removeAttr("disabled");
	$("#resultPanel").css("color", "black").text("Successfully generated and signed transaction with your Keystore wallet! You can now send it out.");
}

function signAndSendTransaction() {
	if (!signedTx || signedTx === "" || signedTx.startsWith("Error"))
		return;
	$("#signButton").hide().css("backgroundColor", "gray").attr("disabled", "disabled");
	$("#transactionPanel").hide();
	var useInstantSend = $("#useInstantSend").is(':checked');
	var usePrivateSend = $("#usePrivateSend").is(':checked');
	$("#resultPanel").css("color", "black").text("Sending signed transaction to the Dash network ..");
	$.get("/SendSignedTx?signedTx=" + signedTx + "&instantSend=" + useInstantSend).done(
	function (finalTx) {
		$("#resultPanel").css("color", "orange").html(
			"Successfully signed transaction and broadcasted it to the Dash network. "+
			(useInstantSend ? "You used InstantSend, the target wallet will immediately see incoming Dash." : "")+
			"You can check the transaction status in a few minutes here: <a href='https://explorer.dash.org/tx/" + finalTx+"' target='_blank' rel='noopener noreferrer'>"+finalTx+"</a>"+(usePrivateSend?getPrivateSendFinalHelp() : ""));
	}).fail(function (jqxhr) {
		$("#resultPanel").css("color", "red").text("Server Error: " + jqxhr.responseText);
	});
}

function getPrivateSendFinalHelp() {
	return "<br /><br/>PrivateSend transactions require mixing. Usually small amounts are available right away and will arrive on the given target address anonymously in a few minutes, but it could also take a few hours. Please be patient, if you still can't see the Dash arriving a day later please <a href='mailto:Support@MyDashWallet.org'>contact support</a> with all data listed here.";
}

function showRawTxPanel(toAddress, txFee, privateSendAddress, redirectedPrivateSendAmount) {
	var rawTxList = $("#rawTransactionData");
	rawTxList.empty();
	var useInstantSend = $("#useInstantSend").is(':checked');
	var usePrivateSend = $("#usePrivateSend").is(':checked');
	if (usePrivateSend)
		$("<li>Sending <b>" + showDashOrMDashNumber(redirectedPrivateSendAmount) + "</b> (with PrivateSend tx fees) to new autogenerated PrivateSend address <a href='https://explorer.dash.org/address/" + privateSendAddress + "' target='_blank' rel='noopener noreferrer'><b>" + privateSendAddress + "</b></a>. When mixing is done (between right away and a few hours) <b>" + showDashOrMDashNumber(amountToSend) + "</b> will anonymously arrive at: <a href='https://explorer.dash.org/address/" + toAddress + "' target='_blank' rel='noopener noreferrer'><b>" + toAddress + "</b></a></li>").appendTo(rawTxList);
	else
		$("<li>Sending <b>" + showDashOrMDashNumber(amountToSend) + "</b> to <a href='https://explorer.dash.org/address/" + toAddress + "' target='_blank' rel='noopener noreferrer'><b>" + toAddress + "</b></a></li>").appendTo(rawTxList);
	//not needed: $("<li>" + amountToSend + " DASH is currently: <b>$" + showNumber(amountToSend * usdRate, 2) + " = €" + showNumber(amountToSend * eurRate, 2) + " = £" + showNumber(amountToSend * gbpRate, 2) + "</b></li>").appendTo(rawTxList);
	$("<li>InstantSend: <b>" + (useInstantSend ? "Yes" : "No") + "</b>, PrivateSend: <b>" + (usePrivateSend ? "Yes" : "No") + "</b>, Tx fee: <b>" + showDashOrMDashNumber(txFee) + "</b> ($" + showNumber(txFee * usdRate, 4) + ")</li>").appendTo(rawTxList);
	return rawTxList;
}

function showTxDetails() {
	$("#txDetailsPanel").prop('onclick',null).off('click');
	$("#txDetailsPanel").html(
		(rawTx !== "" ? "Confirm raw tx with any Dash node in the debug console:<br />decoderawtransaction " + rawTx + "<br />" : "") +
		(signedTx !== "" ? "Signed tx send into the Dash network: " + signedTx : ""));
	return false;
}

function getAddressesWithUnspendFunds() {
	var addresses = [];
	var addressIndex = 0;
	$.each(addressBalances,
		function(key, amount) {
			if (amount > 0)
				addresses.push({ addressIndex: addressIndex, address: key });
			addressIndex++;
		});
	return addresses;
}

function importKeystoreWallet() {
	$("#createLocalWalletPanel").hide();
	$("#unlockKeystorePanel").hide();
	$("#importKeystoreButton").hide();
	$("#importKeystorePanel").show();
}

function loadKeystoreFile() {
	if (!window.FileReader)
		showFailure("FileReader API is not supported by your browser.");
	else if (!$("#keystoreFile")[0].files || !$("#keystoreFile")[0].files[0])
		showFailure("Please select a keystore file!");
	else {
		var file = $("#keystoreFile")[0].files[0];
		var fr = new FileReader();
		fr.onload = function() {
			localStorage.setItem("keystore", fr.result);
			$("#importKeystorePanel").hide();
			$("#createLocalWalletPanel").hide();
			$("#unlockKeystorePanel").show();
			$("#resultPanel").show().css("color", "black").html("Imported your Keystore file into browser.");
		};
		fr.readAsText(file);
	}
}

function importPrivateKey() {
	$("#privateKeyInputPanel").show();
	$("#importPrivateKeyButton").css("background-color", "gray");
}

function importPrivateKeyToKeystore() {
	var key = $("#privateKeyInput").val();
	if (!key || key.length !== 64) {
		$("#createPrivateKeyNotes").text("Invalid private key, it must be exactly 64 characters long!");
		return;
	}
	$("#privateKeyInputPanel").hide();
	deleteKeystore();
	createKeystoreWallet();
}

function showFailure(errorMessage) {
	$("#response").css("color", "red").html(errorMessage).show();
}

var dashKeystoreWallet;
function createKeystoreWallet() {
	$("#createKeystoreButton").attr("disabled", "disabled");
	$("#createKeystoreOutput").html("<b>Successfully generated keystore wallet</b>, please secure it with a password now! Write this down somewhere, if you lose this you CANNOT access your keystore file, nobody can help you if you don't have your password and file.");
	$("#createKeystorePasswordPanel").show();
	$("#createKeystoreButton").hide();
}

function passwordChanged() {
	var password = $("#keystorePassword").val();
	var passwordRepeated = $("#keystorePasswordRepeated").val();
	if (password.length < 8)
		$("#passwordResult").text("Password is too short. Please enter at least 8 characters.");
	else if (password.length > 512)
		$("#passwordResult").text("Password is too long, use something more reasonable (max. 512 characters)");
	else if (password.search(/\d/) === -1 && password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) === -1)
		$("#passwordResult").text("Password should contain at least one number or symbol!");
	else if (password.search(/[a-zA-Z]/) === -1)
		$("#passwordResult").text("Password should contain at least one letter (a-z)!");
	else if (password !== passwordRepeated)
		$("#passwordResult").text("Repeated password is not the same!");
	else {
		$("#passwordResult").html("<b>Successfully secured keystore wallet</b>, click 'Download Keystore file' and keep it at a secure place!");
		$("#keystorePassword").attr("disabled", "disabled");
		$("#keystorePasswordRepeated").attr("disabled", "disabled");
		$("#generateKeystoreButton").removeAttr("disabled");
	}
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function generateKeystoreFile() {
	// Use given private key or create new one if no private key import was done
	var key = $("#privateKeyInput").val();
	if (!key || key.length !== 64)
		key = window.generatePrivateKey();
	$("#createKeystorePasswordPanel").hide();
	var encryptedData = CryptoJS.AES.encrypt(key, $("#keystorePassword").val());
	localStorage.setItem("keystore", encryptedData);
	var currentDate = new Date();
	download("MyDashWallet"+currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate()+".KeyStore", encryptedData);
	$("#createLocalWalletPanel").hide();
	$("#unlockKeystorePanel").show();
}

function unlockKeystore() {
	try {
		var encryptedData = localStorage.getItem("keystore");
		dashKeystoreWallet = { d: encryptedData, s: $("#keystorePasswordUnlock").val() };
		dashKeystoreWallet.address =
			window.getDecryptedAddress(CryptoJS.AES.decrypt(dashKeystoreWallet.d, dashKeystoreWallet.s)
				.toString(CryptoJS.enc.Utf8));
		if (!isValidDashAddress(dashKeystoreWallet.address))
			showFailure("Invalid Dash address from decrypted keystore file, unable to continue: " + dashKeystoreWallet.address);
		else {
			goToSendPanel("Successfully unlocked Keystore Wallet!");
			$("#paperWalletPanel").show();
			$.get("https://explorer.dash.org/chain/Dash/q/addressbalance/" + dashKeystoreWallet.address,
				function (data, status) {
					if (status === "success" && data !== "ERROR: address invalid") {
						//console.log("Updating balance of " + dashKeystoreWallet.address + ": " + data);
						addressBalances[dashKeystoreWallet.address] = parseFloat(data);
						updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses();
						autoBalanceCheck = window.setInterval(tryBalanceCheck, 1000);
					}
				});
		}
	} catch (e) {
		showFailure("Failed to decrypt keystore file: " + e);
	}
}

function deleteKeystore() {
	dashKeystoreWallet = undefined;
	localStorage.removeItem("keystore");
	$("#createLocalWalletPanel").show();
	$("#unlockKeystorePanel").hide();
}

function createPaperWallet() {
	if ($("#paperWalletPasswordUnlock").val() !== dashKeystoreWallet.s) {
		$("#paperWalletError").text("Invalid password, cannot unlock keystore wallet for PaperWallet!");
		return;
	}
	if ($("#paperWalletDetails").is(":visible")) {
		$("#createPaperWalletButton").text("Create PaperWallet");
		$("#paperWalletDetails").hide();
		return;
	}
	$("#createPaperWalletButton").text("Hide PaperWallet");
	$("#paperWalletError").text("");
	$("#privateKey").val(CryptoJS.AES.decrypt(dashKeystoreWallet.d, dashKeystoreWallet.s).toString(CryptoJS.enc.Utf8));
	$("#privateKeyQr").attr("src", "//chart.googleapis.com/chart?cht=qr&chl=" + CryptoJS.AES.decrypt(dashKeystoreWallet.d, dashKeystoreWallet.s).toString(CryptoJS.enc.Utf8) + "&choe=UTF-8&chs=160x160&chld=L|0");
	$("#paperWalletDetails").show();
}