import React, { Component } from 'react'
import styled from 'styled-components'
import QrReader from 'react-qr-reader'
import { Mnemonic, Transaction } from '@dashevo/dashcore-lib'
import { NotificationManager } from 'react-notifications'
import TrezorConnect from 'trezor-connect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import { Resolution } from '@unstoppabledomains/resolution'
import SkyLight from 'react-skylight'
import * as send from './send.js'

var lastKnownNumberOfInputs = 1
var txFee = 192 * send.DASH_PER_DUFF
const Panel = styled.div`
	float: left;
	width: 48%;
	margin-right: 4%;
	position: relative;
	background: #fff;
	padding: 15px;
	border-radius: 15px;
	box-shadow: 3px 3px 3px #dadbdb;
	@media screen and (max-width: 768px) {
		float: none;
		width: 100%;
		margin-right: 0;
		margin-bottom: 10px;
		font-size: 12px;
	}
`
const resolution = new Resolution()

export class SendDash extends Component {
	constructor(props) {
		super(props)
		this.state = {
			destinationAddress: '',
			resolvedDestAddr: '',
			amountToSend: 0,
			amountUsd: 0,
			error: '',
			password: '',
		}
	}
	componentDidMount() {
		this.updateTxFee(1)
		this.setState({
			destinationAddress: '',
			resolvedDestAddr: '',
			amountToSend: 0,
			error: '',
		})
	}
	sendDash = () => {
		this.isValidAddress(this.state.destinationAddress).then((isValidAddress) => {
			if (
				this.state.amountToSend < send.DUST_AMOUNT_IN_DASH ||
				this.state.amountToSend > this.props.totalBalance ||
				!isValidAddress
			) {
				NotificationManager.error(!isValidAddress ? 'Invalid address' : 'Invalid amount')
				this.setState({
					error:
						'Please use an amount you have and a valid address to send to. Unable to create transaction.',
				})
			} else if (!this.props.isCorrectPasswordHash(this.state.password)) {
				this.setState({
					error: 'Please enter your correct password to unlock your wallet for sending DASH.',
				})
			} else {
				this.props.setRememberedPassword(this.state.password)
				this.addNextAddressWithUnspendFundsToRawTx(
					this.getAddressesWithUnspendFunds(),
					0,
					this.props.getUnusedAddress(),
					0,
					[],
					[],
					[],
					''
				)
				this.confirmSendDialog.hide()
			}
		})
	}
	getAddressesWithUnspendFunds = () => {
		var addresses = []
		var addressIndex = 0
		for (var key of Object.keys(this.props.addressBalances)) {
			var amount = this.props.addressBalances[key]
			if (!isNaN(amount) && amount > send.DUST_AMOUNT_IN_DASH)
				addresses.push({ addressIndex: addressIndex, address: key })
			addressIndex++
		}
		return addresses
	}
	handleErrors = response => {
		if (!response.ok) {
			if (typeof response.text === 'function') {
				return response.text().then(errorMessage => {
					throw Error(response.status + ': ' + errorMessage)
				})
			} else throw Error(response.status + ': ' + response.statusText)
		}
		return response.json()
	}
	handleErrorsText = response => {
		if (!response.ok) {
			if (typeof response.text === 'function') {
				return response.text().then(errorMessage => {
					throw Error(response.status + ': ' + errorMessage)
				})
			} else throw Error(response.status + ': ' + response.statusText)
		}
		return response.text()
	}
	getSign = () => {
		return this.props.selectedCurrency === 'EUR' ? '€' : '$'
	}
	// this is only a guess as we don't know how many inputs are on each address, but on a normal hd wallet it is quite ok
	getNumberOfInputsRequired = amountToSend => {
		var numberOfAddressesToUse = 0
		for (var key of Object.keys(this.props.addressBalances)) {
			var amount = this.props.addressBalances[key]
			if (!isNaN(amount) && amount > send.DUST_AMOUNT_IN_DASH) {
				numberOfAddressesToUse++
				amountToSend -= amount
				if (amountToSend <= 0) return numberOfAddressesToUse
			}
		}
		return numberOfAddressesToUse
	}
	updateTxFee = numberOfInputs => {
		if (!numberOfInputs || numberOfInputs <= 0) {
			// Try to figure out how many inputs we would need if we have multiple addresses
			numberOfInputs = 0
			var amountToCheck = this.state.amountToSend
			for (var address of Object.keys(this.props.addressBalances)) {
				var amount = this.props.addressBalances[address]
				if (amount > 0 && amountToCheck > 0.00000001) {
					numberOfInputs++
					amountToCheck -= amount
				}
			}
			if (numberOfInputs === 0) numberOfInputs = lastKnownNumberOfInputs
		}
		lastKnownNumberOfInputs = numberOfInputs
		// mDASH tx fee with 1 duff/byte with default 226 byte tx for 1 input, 374 for 2 inputs (78+148*
		// inputs). All this is recalculated below and on the server side once number of inputs is known.
		txFee = (0.00078 + 0.00148 * numberOfInputs) / 1000
		if (!txFee) txFee = 192 * send.DASH_PER_DUFF
		/*
		// PrivateSend number of needed inputs depends on the amount, not on the inputs (fee for that
		// is already calculated above). Details on the /AboutPrivateSend help page
		if ($("#usePrivateSend").is(':checked'))
			txFee += 1 + getPrivateSendNumberOfInputsBasedOnAmount();
		*/
		if (
			this.state.amountToSend < send.DUST_AMOUNT_IN_DASH ||
			this.state.amountToSend > parseFloat(this.props.totalBalance) + send.DUST_AMOUNT_IN_DASH
		) {
			//$("#generateButton").css("backgroundColor", "gray").attr("disabled", "disabled");
			if (this.state.amountToSend > 0) this.setState({ amountToSend: 0 })
		}
	}
	getTotalAmountNeededByRecalculatingTxFee = txToUse => {
		// Recalculate txFee, now we know the actual number of inputs needed
		this.updateTxFee(txToUse.length)
		// Some users had problems with strings being added, make sure we only have numbers here!
		var totalAmountNeeded = parseFloat(this.state.amountToSend) + parseFloat(txFee)
		// If we send everything, subtract txFee so we can actually send everything
		if (totalAmountNeeded >= this.props.totalBalance)
			totalAmountNeeded = parseFloat(this.props.totalBalance)
		return totalAmountNeeded
	}
	addNextAddressWithUnspendFundsToRawTx = (
		addressesWithUnspendInputs,
		addressesWithUnspendInputsIndex,
		remainingAddress,
		txAmountTotal,
		txToUse,
		txOutputIndexToUse,
		txAddressPathIndices,
		inputListText
	) => {
		if (addressesWithUnspendInputsIndex >= addressesWithUnspendInputs.length) {
			NotificationManager.error('Insufficient funds')
			this.setState({
				error:
					"Looks like you don't have enough funds to complete this transaction. If you do, wait for the next block. Please email support@mydashwallet.org for assistance.",
			})
			return
		}
		this.setState({ error: '' })
		var component = this
		var address = addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address
		//console.log('addNextAddressWithUnspendFundsToRawTx ' + address + ' index=' + addressesWithUnspendInputsIndex)
		var isBlockchair = this.props.explorer === 'blockchair.com/dash'
		fetch(
			isBlockchair
				? 'https://api.blockchair.com/dash/dashboards/address/' +
						addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address +
						'?key=' +
						process.env.REACT_APP_BLOCKCHAIR_API_KEY
				: 'https://' +
						this.props.explorer +
						'/insight-api/addr/' +
						addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address +
						'/utxo',
			{
				mode: 'cors',
				cache: 'no-cache',
			}
		)
			.then(component.handleErrors)
			.then(utxos => {
				if (isBlockchair)
					utxos =
						utxos['data'][addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address][
							'utxo'
						]
				var thisAddressAmountToUse = 0
				var totalAmountNeeded = component.getTotalAmountNeededByRecalculatingTxFee(txToUse)
				for (var i = 0; i < utxos.length; i++) {
					var amount = isBlockchair ? utxos[i]['value'] * send.DASH_PER_DUFF : utxos[i]['amount']
					if (amount >= send.DUST_AMOUNT_INPUTS_IN_DASH) {
						txToUse.push(utxos[i][isBlockchair ? 'transaction_hash' : 'txid'])
						txOutputIndexToUse.push(utxos[i][isBlockchair ? 'index' : 'vout'])
						txAddressPathIndices.push(
							addressesWithUnspendInputs[addressesWithUnspendInputsIndex].addressIndex
						)
						thisAddressAmountToUse += amount
						txAmountTotal += amount
						totalAmountNeeded = component.getTotalAmountNeededByRecalculatingTxFee(txToUse)
						if (txAmountTotal >= totalAmountNeeded) break
					}
				}
				inputListText +=
					'https://' +
					this.props.explorer +
					(this.props.explorer === 'insight.dash.org' ? '/insight' : '') +
					'/address/' +
					address +
					' (-' +
					component.props.showDashNumber(thisAddressAmountToUse) +
					')'
				// Add extra offset in case we are very close to the txFee with total amount!
				if (txAmountTotal >= totalAmountNeeded - txFee * 2) {
					// We have all the inputs we need, we can now create the raw tx
					//$("#transactionPanel").show();
					//debug: inputListText += "<li>Done, got all inputs we need:</li>";
					var utxosTextWithOutputIndices = ''
					for (var index = 0; index < txToUse.length; index++) {
						//debug: inputListText += "<li>"+txToUse[index]+", "+txOutputIndexToUse[index]+"</li>";
						utxosTextWithOutputIndices += txToUse[index] + '|' + txOutputIndexToUse[index] + '|'
					}
					var sendTo = component.state.resolvedDestAddr
					//var usePrivateSend = false //TODO: $("#usePrivateSend").is(':checked');
					// Update amountToSend in case we had to reduce it a bit to allow for the txFee
					var amountToSend = totalAmountNeeded - txFee
					if (component.state.amountToSend !== amountToSend) component.setState({ amountToSend })
					var remainingDash = txAmountTotal - totalAmountNeeded
					fetch('https://old.mydashwallet.org/generateTx', {
						mode: 'cors',
						cache: 'no-cache',
						method: 'POST',
						body: JSON.stringify({
							utxos: utxosTextWithOutputIndices,
							amount: component.props.showNumber(amountToSend, 8),
							sendTo: sendTo.replace('#', '|'),
							remainingAmount: component.props.showNumber(remainingDash, 8),
							remainingAddress: remainingAddress,
						}),
						headers: { 'Content-Type': 'application/json' },
					})
						.then(component.handleErrors)
						.then(data => {
							var txHashes = data['txHashes']
							var rawTx = data['rawTx']
							txFee = data['usedSendTxFee'] || txFee
							//console.log("txHashes: %O", txHashes);
							//console.log("rawTx: %O", rawTx);
							//console.log("txFee: %O", txFee);
							console.log(
								'Using these inputs from your addresses to send <b>' +
									component.props.showDashNumber(totalAmountNeeded) +
									'</b> (with fees): ' +
									inputListText
							)
							if (remainingDash > 0)
								console.log(
									'The remaining ' +
										component.props.showDashNumber(remainingDash) +
										' will be send to your own receiving address: https://' +
										this.props.explorer +
										(this.props.explorer === 'insight.dash.org' ? '/insight' : '') +
										'/address/' +
										remainingAddress
								)
							if (component.props.trezor)
								component.signRawTxOnTrezorHardware(
									txHashes,
									rawTx,
									txOutputIndexToUse,
									txAddressPathIndices
								)
							else if (component.props.ledger)
								component.signRawTxOnLedgerHardware(
									txHashes,
									rawTx,
									txOutputIndexToUse,
									txAddressPathIndices
								)
							else component.signRawTxWithKeystore(txHashes, txOutputIndexToUse, rawTx)
						})
						.catch(function(serverError) {
							NotificationManager.error('Server error')
							component.setState({
								error: 'Server Error: ' + (serverError.message || serverError),
							})
						})
					return
				}
				// Not done yet, get next address
				addressesWithUnspendInputsIndex++
				if (addressesWithUnspendInputsIndex < addressesWithUnspendInputs.length)
					component.addNextAddressWithUnspendFundsToRawTx(
						addressesWithUnspendInputs,
						addressesWithUnspendInputsIndex,
						remainingAddress,
						txAmountTotal,
						txToUse,
						txOutputIndexToUse,
						txAddressPathIndices,
						inputListText
					)
				else {
					NotificationManager.error('Insufficient funds')
					component.setState({
						error:
							'Insufficient funds, cannot send ' +
							totalAmountNeeded +
							' Dash (including tx fee), you only have ' +
							component.props.totalBalance +
							' Dash. Unable to create transaction (please refresh this site if you have enough Dash)! Your inputs so far:<br><ul>' +
							inputListText +
							'</ul>',
					})
				}
			})
			.catch(error => {
				NotificationManager.error('Server error')
				component.setState({ error: error.message || error })
			})
	}
	signRawTxWithKeystore = (txHashes, txOutputIndexToUse, rawTx) => {
		//console.log("rawTx %O", rawTx);
		var txFeeInDuffs = Math.round(txFee * 100000000)
		//console.log("txFeeInDuffs %O", txFeeInDuffs);
		var signedTx = this.signRawTx(
			txHashes,
			txOutputIndexToUse,
			rawTx,
			txFeeInDuffs,
			this.getDashHDWalletPrivateKeys()
		)
		//console.log("signed tx %O", signedTx);
		if (signedTx.startsWith('Error')) {
			NotificationManager.error('Signing Transaction failed')
			this.setState({ error: 'Signing Transaction failed. ' + signedTx })
			return
		}
		this.sendSignedTx(signedTx)
	}
	signRawTxOnTrezorHardware = (txHashes, rawTx, txOutputIndexToUse, txAddressPathIndices) => {
		// already all done in generateTrezorSignedTx
	}
	signRawTxOnLedgerHardware = (txHashes, rawTx, txOutputIndexToUse, txAddressPathIndices) => {
		var txs = []
		var addressPaths = []
		for (var i = 0; i < txHashes.length; i++) {
			var parsedTx = this.props.ledger.splitTransaction(txHashes[i])
			if (!parsedTx.inputs || parsedTx.inputs.length === 0) {
				this.setState({ error: 'Empty broken raw tx for input ' + i + ', unable to continue' })
				return
			}
			txs.push([parsedTx, txOutputIndexToUse[i]])
			if (txAddressPathIndices[i] === undefined) {
				this.setState({
					error: 'Empty broken address path index for input ' + i + ', unable to continue',
				})
				return
			}
			addressPaths.push("44'/5'/0'/0/" + txAddressPathIndices[i])
		}
		var parsedRawtx = this.props.ledger.splitTransaction(rawTx)
		//console.log("parsedRawtx: %O", parsedRawtx);
		if (!parsedRawtx || parsedRawtx.outputs.length === 0) {
			this.setState({ error: 'Empty broken raw tx outputs, unable to continue' })
			return
		}
		var outputScript = this.props.ledger.serializeTransactionOutputs(parsedRawtx).toString('hex')
		//console.log("outputScript: %O", outputScript);
		if (!outputScript) {
			this.setState({ error: 'Empty broken raw tx output script, unable to continue' })
			return
		}
		this.setState({
			error:
				'Sign the transaction output#1, output#2 and Transaction with shown fee (compare with the values above, they should match) with your hardware device to send it to the Dash network!',
		})
		// Sign on hardware (specifying the change address gets rid of change output confirmation)
		var remainingAddressPath = undefined
		this.props.ledger.EXTENSION_TIMEOUT_SEC = 90
		var component = this
		this.props.ledger
			.createPaymentTransactionNew(txs, addressPaths, remainingAddressPath, outputScript)
			.then(function(finalSignedTx) {
				component.sendSignedTx(finalSignedTx)
			})
			.catch(function(error) {
				this.setState({ error: component.getLedgerErrorText(error) })
			})
	}
	getLedgerErrorText = error => {
		//https://github.com/kvhnuke/etherwallet/issues/336
		if (error === 'Invalid status 6faa')
			return (
				'The device is currently locked or not in the Dash app, please unlock and try again! ' +
				error +
				'.'
			)
		else if (error === 'Invalid status 6f04')
			return (
				'The device is currently locked or not in the Dash app, probably auto-locked. Please unlock and try again (some users reported disabling auto-lock helped or they restarted). ' +
				error +
				'.'
			)
		//https://www.eftlab.com/index.php/site-map/knowledge-base/118-apdu-response-list
		//https://github.com/LedgerHQ/ledger-live-desktop/issues/1386
		//https://github.com/LedgerHQ/ledger-live-desktop/issues/1239
		else if (error === 'Invalid status 6f00')
			return (
				error +
				': Command aborted - more exact diagnosis not possible (e.g., operating system error). Please try again, use a different browser (chrome, firefox, opera all support u2f for Ledger) and contact Ledger if this error continues to happen (Btc app or firmware issue).'
			)
		else if (error === 'Invalid status 6985')
			return (
				'User denied the transaction on the hardware device (or the tx is invalid and was rejected before showing up), aborting! ' +
				error
			)
		else if (error === 'Invalid status 6a80')
			return (
				error +
				': Usually means contract data is not enabled on the device, but more likely the data is not in a correct format and was rejected by the hardware device.'
			)
		//https://github.com/ArkEcosystem/desktop-wallet/issues/277
		else if (error === 'Invalid status 6d00')
			return 'Invalid status 6d00: API error, function not implemented or invalid data passed.'
		var errorText = error.errorCode
			? 'Error code=' + error.errorCode + ' ' + error.errorMessage
			: 'Unknown error: ' + error + '.'
		if (errorText === 'No device found')
			errorText += ' Make sure to connect a device and unlock it.'
		else if (error === 'Invalid status 6804')
			errorText +=
				' Security Exception. This means an invalid BIP32 path was provided. Do you have hardening in the right places?'
		else if (errorText === 'Invalid status 6982')
			errorText += ' Device timed out or is locked again. Please re-enter pin on the device.<br/>'
		//'OK': 0,
		//'OTHER_ERROR': 1,
		else if (error.errorCode === 1)
			errorText +=
				' Other error, this usually means your browser does not support <a href="https://wikipedia.org/wiki/U2F">U2F</a>. Please use Chrome, which works best!'
		//'BAD_REQUEST': 2,
		else if (error.errorCode === 2)
			errorText +=
				' Not running in secure context (must be https), unable to connect to Ledger.<br/>https://github.com/LedgerHQ/ledger-node-js-api/issues/32'
		//'CONFIGURATION_UNSUPPORTED': 3,
		else if (error.errorCode === 3)
			errorText +=
				' Configuration unsupported. Make sure your device is fully setup and operational and in the Dash app.'
		//'DEVICE_INELIGIBLE': 4,
		else if (error.errorCode === 4)
			errorText = ' Dash app is not open on Ledger. Please open the Dash app to continue.'
		//'TIMEOUT': 5
		else if (error.errorCode === 5)
			errorText +=
				"<br />Please turn on auto approval in the Dash app Settings on the Ledger (some devices/firmwares are buggy and time out when manually approving each time).<br />Error code 5 can also mean that your Ledger is opened and being used by another application, such as Ledger Live.<br />Unable to retrieve key or unable to connect to Ledger Hardware (20s timeout?). Some browsers also disallow this on localhost or need multiple tries.<br /><a href='https://www.reddit.com/r/ledgerwallet/comments/b14jed/still_getting_u2f_timeout/'>More information about this issue can be found here</a>. Hopefully the next version of the Ledger firmware and apps fixes this, try again, reconnect and ask Ledger support for help!"
		else if (error.errorCode === 400)
			errorText +=
				' Please update your hardware device, seems like an error occurred while updating. https://ledger.zendesk.com/hc/en-us/articles/115005171225-Error-Code-400'
		else if (error.errorCode) errorText = 'Unknown ' + errorText
		return errorText
	}
	sendSignedTx = signedTx => {
		var component = this
		fetch('https://old.mydashwallet.org/sendTx', {
			mode: 'cors',
			cache: 'no-cache',
			method: 'POST',
			body: JSON.stringify({ signedTx: signedTx }),
			headers: { 'Content-Type': 'application/json' },
		})
			.then(component.handleErrorsText)
			.then(finalTx => {
				NotificationManager.success(
					'Sent ' +
						component.props.showDashNumber(component.state.amountToSend) +
						' to ' +
						component.state.resolvedDestAddr,
					'Success'
				)
				var newBalance = component.props.totalBalance - (component.state.amountToSend + txFee)
				if (newBalance < send.DUST_AMOUNT_IN_DASH) newBalance = 0
				NotificationManager.info('New balance: ' + component.props.showDashNumber(newBalance))
				component.setState({
					error: '',
					password: '',
					sendTransaction: finalTx,
					amountToSend: 0,
				})
				component.props.setNewTotalBalance(newBalance)
				component.successSendDialog.show()
				component.props.addTransaction({
					id: finalTx,
					amountChange: -(component.state.amountToSend + txFee),
					time: new Date(),
					confirmations: 0,
					size: txFee * 100000000,
					fees: txFee,
					txlock: true,
				})
				component.props.onUpdateBalanceAndAddressesStorage(newBalance, component.props.addresses)
			})
			.catch(function(serverError) {
				NotificationManager.error('Server Error')
				component.setState({ error: 'Server Error: ' + (serverError.message || serverError) })
			})
	}
	getDashHDWalletPrivateKeys = () => {
		var keys = []
		var index = 0
		var mnemonic = new Mnemonic(this.props.onDecrypt(this.props.hdSeedE, this.state.password))
		var xpriv = mnemonic.toHDPrivateKey()
		Object.keys(this.props.addressBalances).forEach(() => {
			keys.push(xpriv.derive("m/44'/5'/0'/0/" + index).privateKey)
			index++
		})
		return keys
	}
	signRawTx = (rawUtxosHashes, rawUtxosOutputIndex, rawTx, txFeeInDuffs, keys) => {
		try {
			// Due to a tx sign bug where output (script and satoshi amount) get lost when using our rawTx
			// we need to recreate the whole transaction: https://github.com/bitpay/bitcore/issues/1199
			var transaction = new Transaction()
			// Adjust defaults as bitcore library is not suited for our low tx fees
			Transaction.DUST_AMOUNT = 572
			Transaction.FEE_PER_KB = 1000
			Transaction.FEE_SECURITY_MARGIN = 100 //needed to allow InstantSend tx: 31;
			transaction.fee(txFeeInDuffs)
			for (var i = 0; i < rawUtxosHashes.length; i++) {
				var inputTransaction = new Transaction(rawUtxosHashes[i])
				//console.log("inputTransaction %O", inputTransaction);
				// Recreate utxo from existing data, address is not needed, output index is obviously important
				var utxo = {
					txId: inputTransaction.hash,
					outputIndex: rawUtxosOutputIndex[i],
					script: inputTransaction.outputs[rawUtxosOutputIndex[i]].script,
					satoshis: inputTransaction.outputs[rawUtxosOutputIndex[i]].satoshis,
				}
				//console.log("utxo %O", utxo);
				transaction.from(utxo)
			}
			// Just copy outputs over, they have been already calculated and have the correct fee, etc.
			var rawTransaction = new Transaction(rawTx)
			//console.log("rawTransaction %O", rawTransaction);
			for (var index = 0; index < rawTransaction.outputs.length; index++) {
				//console.log("add output index=" + index);
				//console.log("add output %O", rawTransaction.outputs[index]);
				transaction.addOutput(rawTransaction.outputs[index])
			}
			// And we are done, sign raw transaction with the given keystore private key
			transaction = transaction.sign(keys)
			// If anything went wrong, return that error to user (if signed tx starts with "Error: " it
			// didn't work out, otherwise we have the signed tx ready to broadcast).
			if (transaction.getSerializationError())
				return 'Error: ' + transaction.getSerializationError().message
			return transaction.toString()
		} catch (e) {
			return 'Error: ' + e.toString()
		}
	}
	handleScan = data => {
		if (data) {
			this.setState({
				enableQrScanner: false,
				destinationAddress: data.replace('dash:', '').split('?')[0],
				addressPreviewResult: 'Successfully scanned QR code',
			})
		}
	}
	generateTrezorSignedTx = () => {
		//all this get address/utxo stuff is not required on Trezor, we can simply use it
		// Minimum fee we need to use for sending is 226 duff, for safety use twice that,
		// otherwise trezor reports: Account funds are insufficient. Retrying...
		if (txFee < 226 * send.DASH_PER_DUFF) txFee = 2 * txFee
		var sendAmount = this.state.amountToSend
		// If we send everything, subtract txFee so we can actually send everything
		if (this.state.amountToSend + txFee >= this.props.totalBalance)
			sendAmount = this.props.totalBalance - txFee
		var component = this
		TrezorConnect.cancel() //TODO: just do initial stuff like ledger
		TrezorConnect.composeTransaction({
			outputs: [
				{
					address: this.state.resolvedDestAddr,
					amount: '' + Math.round(sendAmount / send.DASH_PER_DUFF), //in duff
				},
			],
			coin: 'dash',
			push: true,
		}).then(function (result) {
			if (result.success) {
				//not needed, we pushed already via trezor: component.sendSignedTx(result.payload.serializedTx)
				NotificationManager.success(
					'Sent ' +
						component.props.showDashNumber(sendAmount) +
						' to ' +
						component.state.resolvedDestAddr,
					'Success'
				)
				var newBalance = component.props.totalBalance - (sendAmount + txFee)
				if (newBalance < send.DUST_AMOUNT_IN_DASH) newBalance = 0
				NotificationManager.info('New balance: ' + component.props.showDashNumber(newBalance))
				component.setState({
					error: '',
					password: '',
					sendTransaction: result.payload.txid,
					amountToSend: 0,
				})
				component.props.setNewTotalBalance(newBalance)
				component.props.addTransaction({
					id: result.payload.txid,
					amountChange: -(sendAmount + txFee),
					time: new Date(),
					confirmations: 0,
					size: txFee * 100000000,
					fees: txFee,
					txlock: true,
				})
				component.props.onUpdateBalanceAndAddressesStorage(newBalance, component.props.addresses)
				component.successSendDialog.show()
			} else {
				component.setState({
					error:
						'Error signing with TREZOR: ' +
						result.payload.error +
						(result.error === 'Amount is to low'
							? ' (Sorry, TREZOR currently only allows transactions above 226 duffs, use more than 0.0000226 DASH)'
							: ''),
				})
			}
		})
	}
	generateLedgerSignedTx = () => {
		this.addNextAddressWithUnspendFundsToRawTx(
			this.getAddressesWithUnspendFunds(),
			0,
			this.props.getUnusedAddress(),
			0,
			[],
			[],
			[],
			''
		)
	}
	isValidAddress = address => {
		return resolution.isRegistered(address)
			.then(isRegistered => {
				if (isRegistered) {
					resolution.addr(address, 'DASH')
						.then((resolvedAddr) => {
							this.setState({ resolvedDestAddr: resolvedAddr })
							return this.props.isValidDashAddress(resolvedAddr)
						})
						.catch((e) => {
							NotificationManager.error('Fail to resolve address')
							this.setState({ error: 'Fail to resolve address: ' + e, resolvedDestAddr: '' })
							return false
						})
				}
				else {
					this.setState({ resolvedDestAddr: address })
					return this.props.isValidDashAddress(address)
				}
			})
			.catch(e =>{
				this.setState({ resolvedDestAddr: '' })
				NotificationManager.error('Fail to check if address is valid')
				this.setState({ error: 'Fail to check if address is valid: ' + e })
				return false
			})
	}
	render = () => {
		return (
			<div>
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.confirmSendDialog = ref)}
					title="Confirm transaction"
				>
					<br />
					Address to send to: <b>{this.state.destinationAddress}</b>
					<br />
					<br />
					Amount in DASH: <b>{this.props.showDashNumber(this.state.amountToSend)}</b>
					<br />
					Amount in {this.props.selectedCurrency}:{' '}
					<b>
						{this.props.showNumber(
							this.state.amountToSend * this.props.getSelectedCurrencyDashPrice(),
							2
						)}
					</b>
					<br />
					<br />
					Fee in DASH: {this.props.showDashNumber(txFee)}
					<br />
					Fee in {this.props.selectedCurrency}:{' '}
					{this.props.showNumber(txFee * this.props.getSelectedCurrencyDashPrice(), 4)}
					<br />
					<br />
					{this.props.trezor || this.props.ledger ? (
						<div style={{ clear: 'both' }}>
							Please confirm your transaction on your hardware device to continue!
						</div>
					) : (
						<div className="input_box col_6 fl password">
							<span
								style={{
									fontWeight: '600',
									fontSize: '18px',
									color: 'var(--body-color)',
									lineHeight: '25px',
									opacity: '0.55',
								}}
							>
								Enter your password to sign the transaction
							</span>
							<p>
								<input
									type="password"
									style={{ borderBottom: '1px solid gray', fontSize: '16px' }}
									value={this.state.password}
									onChange={e => this.setState({ password: e.target.value })}
								/>
							</p>
						</div>
					)}
					<br />
					<br />
					<button
						className="a_btn confirm-btn btn-base btn-orange"
						onClick={() => this.confirmSendDialog.hide()}
					>
						Back
					</button>
					{!this.props.trezor && !this.props.ledger && (
						<button
							style={{ float: 'right' }}
							className="a_btn confirm-btn btn-base btn-orange"
							onClick={() => this.sendDash()}
						>
							Confirm
						</button>
					)}
					<div className="cleardiv">&nbsp;</div>
					<div
						className="error dww-error-msg"
						dangerouslySetInnerHTML={{ __html: this.state.error }}
					/>
				</SkyLight>
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.successSendDialog = ref)}
					title="Success"
				>
					<br />
					Your transaction was successfully sent.
					<br />
					<a
						href={
							'https://' +
							this.props.explorer +
							(this.props.explorer === 'insight.dash.org' ? '/insight' : '') +
							(this.props.explorer === 'blockchair.com/dash' ? '/transaction/' : '/tx/') +
							this.state.sendTransaction
						}
						target="_blank"
						rel="noopener noreferrer"
					>
						{this.state.sendTransaction}
					</a>
					<br />
					<br />
					<p>Your new balance is {this.props.showDashNumber(this.props.totalBalance)}</p>
					<br />
					<div className="error" dangerouslySetInnerHTML={{ __html: this.state.error }} />
					<br />
					<br />
					<button onClick={() => this.successSendDialog.hide()}>Ok</button>
				</SkyLight>
				<Panel>
					<h3>Send DASH</h3>
					<div className="send_step_bg_otr section-send-step1">
						<div className="send_step_form_otr step_1_otr">
							<div className="input_box_otr clearfix">
								<div className="input_box col_12 fl">
									<label>Destination Address:</label>
									<table style={{ width: '100%' }}>
										<tbody>
											<tr>
												<td style={{ width: 'auto' }}>
													<input
														type="text"
														placeholder="Dash Address"
														value={this.state.destinationAddress}
														onChange={e => this.setState({ destinationAddress: e.target.value })}
													/>
												</td>
												<td style={{ width: '35px' }}>
													<FontAwesomeIcon
														icon={faQrcode}
														style={{ marginTop: '3px', fontSize: '32px', float: 'right' }}
														alt="QR Scanner"
														title="Enable QR Scanner"
														onClick={() => {
															if (this.state.enableQrScanner)
																this.setState({ enableQrScanner: false })
															else
																this.setState({
																	enableQrScanner: true,
																	addressPreviewResult:
																		'QR Code Scanner ready, please scan a DASH address!',
																})
														}}
													/>
												</td>
											</tr>
										</tbody>
									</table>
									{this.state.enableQrScanner && (
										<div>
											<QrReader
												delay={300}
												onError={err => this.setState({ addressPreviewResult: err.message })}
												onScan={this.handleScan}
												style={{ width: '100%' }}
											/>
											<p>{this.state.addressPreviewResult}</p>
										</div>
									)}
								</div>
								<br />
								<div className="input_box col_6 fl dash_currency">
									<label>How much DASH do you want to send?</label>
									<table style={{ width: '100%' }}>
										<tbody>
											<tr>
												<td style={{ width: 'auto' }}>
													<input
														type="number"
														value={this.state.amountToSend}
														onChange={e => {
															var newValue = parseFloat(e.target.value)
															if (newValue < 0 || isNaN(newValue)) newValue = 0
															this.setState({
																amountToSend: newValue,
																amountUsd: this.props.showNumber(
																	newValue * this.props.getSelectedCurrencyDashPrice(),
																	2
																),
															})
														}}
													/>
												</td>
												<td style={{ width: '35px' }}>
													<button
														onClick={() =>
															this.setState({
																amountToSend: this.props.totalBalance,
																amountUsd: this.props.showNumber(
																	this.props.totalBalance *
																		this.props.getSelectedCurrencyDashPrice(),
																	2
																),
															})
														}
													>
														Max
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<br />
								<div className="input_box col_6 fl usd_currency">
									<label>Amount {this.props.selectedCurrency}:</label>
									<table style={{ width: '100%' }}>
										<tbody>
											<tr>
												<td style={{ width: 'auto' }}>
													<input
														type="number"
														value={this.state.amountUsd}
														onChange={e => {
															var newValue = parseFloat(e.target.value)
															if (newValue < 0 || isNaN(newValue)) newValue = 0
															this.setState({
																amountUsd: newValue,
																amountToSend: this.props.showNumber(
																	newValue / this.props.getSelectedCurrencyDashPrice(),
																	5
																),
															})
														}}
													/>
												</td>
												<td style={{ width: '35px' }}>
													<button
														onClick={() =>
															this.setState({
																amountToSend: this.props.totalBalance,
																amountUsd: this.props.showNumber(
																	this.props.totalBalance *
																		this.props.getSelectedCurrencyDashPrice(),
																	2
																),
															})
														}
													>
														Max
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<br />
								<div className="input_box col_12 form_btn fl section-next">
									<button
										style={{ float: 'right' }}
										onClick={() => {
											this.isValidAddress(this.state.destinationAddress).then((isValidAddress) => {
												if (!isValidAddress) {
													this.setState({ error: 'Please enter a valid DASH Destination Address' })
												} else if (this.state.amountToSend < send.DUST_AMOUNT_IN_DASH) {
													this.setState({
														error:
															'Make sure to enter a valid amount. Minimum ' +
															send.DUST_AMOUNT_IN_DASH +
															' DASH',
													})
												} else if (this.state.amountToSend > this.props.totalBalance) {
													var balanceError =
														'You got ' +
														this.props.showDashNumber(this.props.totalBalance) +
														', the amount to sent was corrected, please check and press Next again.'
													this.setState({
														amountToSend: this.props.totalBalance,
														amountUsd:
															this.props.totalBalance * this.props.getSelectedCurrencyDashPrice(),
														error: balanceError,
													})
												} else {
													this.setState({ error: '' })
													this.updateTxFee(this.getNumberOfInputsRequired(this.state.amountToSend))
													if (this.props.trezor) this.generateTrezorSignedTx()
													else if (this.props.ledger) this.generateLedgerSignedTx()
													this.confirmSendDialog.show()
												}
											})
										}}
									>
										Next
									</button>
								</div>
								<div className="cleardiv">&nbsp;</div>
								<div className="dww-error-msg">{this.state.error}</div>
							</div>
						</div>
					</div>
				</Panel>
			</div>
		)
	}
}
