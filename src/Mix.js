import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import SkyLight from 'react-skylight'
import * as send from './send.js'
import { Mnemonic, Transaction } from '@dashevo/dashcore-lib'
import { animateScroll } from 'react-scroll'
import styled from 'styled-components'

const SupportedDenominationAmount = 0.0100001
var txFee = 192 * send.DASH_PER_DUFF
var apiUrl = 'https://old.mydashwallet.org/'
const Output = styled.div`
	width: 100%;
	height: 500px;
	border: 1px solid gray;
	padding: 10px;
	background: white;
	overflow: auto;
`

export class Mix extends Component {
	constructor(props) {
		super(props)
		var balanceIn10mDash = parseInt((props.totalBalance - txFee * 11) / SupportedDenominationAmount)
		if (balanceIn10mDash < 1) balanceIn10mDash = 1
		if (balanceIn10mDash > 10) balanceIn10mDash = 10
		balanceIn10mDash *= 10
		this.state = {
			mixingOutput: 'Waiting for user to start',
			password: '',
			amountMDash: balanceIn10mDash,
		}
	}
	componentWillUnmount() {
		clearInterval(this.mixInterval)
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
	sendCollateralAndCreateDenominations() {
		if (!this.props.isCorrectPasswordHash(this.state.password)) {
			this.setState({ error: 'Invalid password!' })
			return
		}
		this.startDialog.hide()
		var component = this
		/*tst, will always return dummy collateral address for now
		fetch('https://old.mydashwallet.org/createMixingSession', {
			mode: 'cors',
			cache: 'no-cache',
			method: 'POST',
			body: JSON.stringify({ amountMDash: this.state.amountMDash }),
			headers: { 'Content-Type': 'application/json' },
		})
			.then(this.handleErrorsText)
			.then(collateralAddress => {
				*/
		var collateralAddress = 'XcVbnLX5TXhtV3bYiWEEMUn7D62YttnzaU'
		component.addOutput('Sending 0.0001 DASH to collateral address: ' + collateralAddress + ' ...')
		component.setState({
			destinationAddress: collateralAddress,
			amountToSend: 0.0001,
			mode: 'collateral',
			error: '',
		})
		//TODO: refactor with SendDash.js
		component.addNextAddressWithUnspendFundsToRawTx(
			component.getAddressesWithUnspendFunds(true),
			0,
			component.getUnusedAddress(),
			0,
			[],
			[],
			[]
		)
		/*		
			})
			.catch(function(serverError) {
				component.addOutput(serverError.message || serverError)
			})
			*/
	}
	addOutput = message => {
		this.setState(
			prevState => ({
				mixingOutput: prevState.mixingOutput + '<br />\n' + message,
			}),
			() => animateScroll.scrollToBottom({ containerId: 'Output' })
		)
	}
	getUnusedAddress = () => {
		var lastAddress = this.props.addresses[this.props.addresses.length - 1]
		var amountOnLastAddress = this.props.addressBalances[lastAddress]
		// We need a new fresh address
		if (amountOnLastAddress > 0) {
			var hdS = this.props.onDecrypt(this.props.hdSeedE, this.state.password)
			if (hdS === '')
				return 'Unable to obtain unused address, the wallet seed cannot be reconstructed!'
			var mnemonic = new Mnemonic(hdS)
			var xpriv = mnemonic.toHDPrivateKey()
			lastAddress = xpriv
				.derive("m/44'/5'/0'/0/" + this.props.addresses.length)
				.privateKey.toAddress()
				.toString()
			this.addLastAddress(lastAddress)
		}
		return lastAddress
	}
	updateTxFee = (numberOfInputs, numberOfOutputs) => {
		txFee = (0.0001 + 0.00148 * numberOfInputs + 0.00034 * numberOfOutputs) / 1000
		if (!txFee) txFee = 192 * send.DASH_PER_DUFF
	}
	getTotalAmountNeededByRecalculatingTxFee = txToUse => {
		// Recalculate txFee, now we know the actual number of inputs needed
		this.updateTxFee(txToUse.length, 2)
		// Some users had problems with strings being added, make sure we only have numbers here!
		var totalAmountNeeded = parseFloat(this.state.amountToSend) + parseFloat(txFee)
		// If we send everything, subtract txFee so we can actually send everything
		if (totalAmountNeeded >= this.props.totalBalance)
			totalAmountNeeded = parseFloat(this.props.totalBalance)
		return totalAmountNeeded
	}
	updateAddressBalance = (address, amount) => {
		this.props.addressBalances[address] = amount
	}
	addNextAddressWithUnspendFundsToRawTx = (
		addressesWithUnspendInputs,
		addressesWithUnspendInputsIndex,
		remainingAddress,
		txAmountTotal,
		txToUse,
		txOutputIndexToUse,
		txAddressPathIndices
	) => {
		if (addressesWithUnspendInputsIndex >= addressesWithUnspendInputs.length) {
			this.addOutput('No funds to complete this collateral transaction.')
			return
		}
		var component = this
		fetch(
			'https://insight.dash.org/insight-api/addr/' +
				addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address +
				'/utxo',
			{
				mode: 'cors',
				cache: 'no-cache',
			}
		)
			.then(component.handleErrors)
			.then(utxos => {
				var totalAmountNeeded = component.getTotalAmountNeededByRecalculatingTxFee(txToUse)
				for (var i = 0; i < utxos.length; i++) {
					var amount = utxos[i]['amount']
					if (amount >= send.DUST_AMOUNT_INPUTS_IN_DASH) {
						txToUse.push(utxos[i]['txid'])
						txOutputIndexToUse.push(utxos[i]['vout'])
						txAddressPathIndices.push(
							addressesWithUnspendInputs[addressesWithUnspendInputsIndex].addressIndex
						)
						txAmountTotal += amount
						totalAmountNeeded = component.getTotalAmountNeededByRecalculatingTxFee(txToUse)
						// Make sure we don't spend from this address again (otherwise we get doublespend errors from the dash node)
						component.updateAddressBalance(
							addressesWithUnspendInputs[addressesWithUnspendInputsIndex].address,
							0
						)
						if (txAmountTotal >= totalAmountNeeded) break
					}
				}
				// Add extra offset in case we are very close to the txFee with total amount!
				if (txAmountTotal >= totalAmountNeeded - txFee * 2) {
					var utxosTextWithOutputIndices = ''
					for (var index = 0; index < txToUse.length; index++)
						utxosTextWithOutputIndices += txToUse[index] + '|' + txOutputIndexToUse[index] + '|'
					var sendTo = component.state.destinationAddress
					// Update amountToSend in case we had to reduce it a bit to allow for the txFee
					var amountToSend = totalAmountNeeded - txFee
					if (component.state.amountToSend !== amountToSend) component.setState({ amountToSend })
					var remainingDash = txAmountTotal - totalAmountNeeded
					fetch(apiUrl + 'generateTx', {
						mode: 'cors',
						cache: 'no-cache',
						method: 'POST',
						body: JSON.stringify({
							utxos: utxosTextWithOutputIndices,
							amount: component.props.showNumber(amountToSend, 8),
							sendTo: sendTo.constructor === Array ? sendTo.join(',') : sendTo,
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
							component.signRawTxWithKeystore(txHashes, txOutputIndexToUse, rawTx)
							// Denominations use case, update addressBalances so we find these inputs
							if (sendTo.constructor === Array) {
								var addressesSendTo = sendTo.join(',')
								for (var i = 0; i < addressesSendTo.length; i++)
									component.updateAddressBalance(
										addressesSendTo[i],
										amountToSend / addressesSendTo.length
									)
							}
							// Collateral usecase, just make sure we have the change address for funds available
							else component.updateAddressBalance(remainingAddress, remainingDash)
						})
						.catch(function(serverError) {
							component.addOutput('Server Error: ' + (serverError.message || serverError))
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
						txAddressPathIndices
					)
				else
					component.addOutput(
						'Insufficient funds, cannot send ' +
							component.props.showNumber(totalAmountNeeded, 8) +
							' Dash (including tx fee), you only have ' +
							component.props.showNumber(txAmountTotal, 8) +
							' Dash. Unable to create transaction. ' +
							'Please go back to Wallet to refresh your balances (this will be fixed in the future).'
					)
			})
			.catch(error => {
				component.addOutput(error.message || error)
			})
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
	getAddressesWithUnspendFunds = skipDenominations => {
		var addresses = []
		var addressIndex = 0
		for (var key of Object.keys(this.props.addressBalances)) {
			var amount = this.props.addressBalances[key]
			if (
				!isNaN(amount) &&
				amount > send.DUST_AMOUNT_IN_DASH &&
				amount < 1000 &&
				(!skipDenominations || amount !== SupportedDenominationAmount)
			)
				addresses.push({ addressIndex: addressIndex, address: key })
			addressIndex++
		}
		return addresses
	}
	signRawTxWithKeystore = (txHashes, txOutputIndexToUse, rawTx) => {
		var txFeeInDuffs = Math.round(txFee * 100000000)
		var signedTx = this.signRawTx(
			txHashes,
			txOutputIndexToUse,
			rawTx,
			txFeeInDuffs,
			this.getDashHDWalletPrivateKeys()
		)
		if (signedTx.startsWith('Error')) {
			this.addOutput('Signing Transaction failed. ' + signedTx)
			return
		}
		this.sendSignedTx(signedTx)
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
			var transaction = new Transaction()
			Transaction.DUST_AMOUNT = 572
			Transaction.FEE_PER_KB = 1000
			Transaction.FEE_SECURITY_MARGIN = 100 //needed to allow InstantSend tx: 31;
			transaction.fee(txFeeInDuffs)
			for (var i = 0; i < rawUtxosHashes.length; i++) {
				var inputTransaction = new Transaction(rawUtxosHashes[i])
				// Recreate utxo from existing data, address is not needed, output index is obviously important
				var utxo = {
					txId: inputTransaction.hash,
					outputIndex: rawUtxosOutputIndex[i],
					script: inputTransaction.outputs[rawUtxosOutputIndex[i]].script,
					satoshis: inputTransaction.outputs[rawUtxosOutputIndex[i]].satoshis,
				}
				transaction.from(utxo)
			}
			// Just copy outputs over, they have been already calculated and have the correct fee, etc.
			var rawTransaction = new Transaction(rawTx)
			for (var index = 0; index < rawTransaction.outputs.length; index++)
				transaction.addOutput(rawTransaction.outputs[index])
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
	getTransactionLink = txId => {
		return (
			"<a href='https://explorer.mydashwallet.org/tx/" +
			txId +
			"' target='_blank' rel='noopener noreferrer'>" +
			txId +
			'</a>'
		)
	}
	sendSignedTx = signedTx => {
		var component = this
		fetch(apiUrl + 'sendTx', {
			mode: 'cors',
			cache: 'no-cache',
			method: 'POST',
			body: JSON.stringify({ signedTx: signedTx }),
			headers: { 'Content-Type': 'application/json' },
		})
			.then(component.handleErrorsText)
			.then(finalTx => {
				if (component.state.mode === 'collateral') {
					component.addOutput(
						'Successfully send mixing collateral initialization transaction: ' +
							component.getTransactionLink(finalTx)
					)
					component.createDenominations()
				} else if (component.state.mode === 'denominations') {
					component.addOutput(
						'Successfully created ' +
							component.state.amountMDash / 10 +
							' denominations inside your wallet: ' +
							component.getTransactionLink(finalTx) +
							component.addMixStartMessage()
					)
					component.waitForMixing()
				} else component.addOutput('Unknown mode: ' + component.state.mode + ', cannot continue')
			})
			.catch(function(serverError) {
				component.addOutput(serverError.message || serverError)
			})
	}
	addMixStartMessage = () => {
		return (
			'\n<br />' +
			'Waiting for Peer-To-Peer clients to mix with, each input needs at least 3 mixing partners to start mixing.' +
			'\n<br />' +
			"Please be patient, you can leave this tab open and return to it at any time. It won't take up much battery on mobile, no work is done here except for checking the explorer every 10s."
		)
	}
	createDenominations = () => {
		var denominations = this.state.amountMDash / 10
		this.addOutput(
			'Trying to create ' +
				denominations +
				' denominations after waiting a few seconds for nodes and explorers to update ..'
		)
		var component = this
		setTimeout(() => component.createDenominationsAfterWaiting(denominations), 3675)
	}
	createDenominationsAfterWaiting = denominations => {
		var hdS = this.props.onDecrypt(this.props.hdSeedE, this.state.password)
		if (hdS === '') {
			this.addOutput('Unable to obtain unused address, the wallet seed cannot be reconstructed!')
			return
		}
		var mnemonic = new Mnemonic(hdS)
		var xpriv = mnemonic.toHDPrivateKey()
		// Check if we already have enough denominations, keep remixing them :)
		var existingDenominationAddresses = this.getAlreadyExistingDenominations()
		if (existingDenominationAddresses.length >= denominations) {
			this.addOutput(
				'Already got enough denominations, skipping denomination creation.' +
					this.addMixStartMessage()
			)
			var newTargetAddresses = []
			for (var j = 0; j < denominations; j++) {
				newTargetAddresses.push(
					xpriv
						.derive("m/44'/5'/0'/0/" + (this.props.addresses.length + (j - 1)))
						.privateKey.toAddress()
						.toString()
				)
			}
			this.setState({ targetAddresses: newTargetAddresses })
			this.waitForMixing()
			return
		}
		// Otherwise keep creating denomations, we need a new fresh address for each denomination
		denominations -= existingDenominationAddresses.length
		var denominationAddresses = []
		for (var i = 0; i < denominations; i++) {
			denominationAddresses.push(
				xpriv
					.derive("m/44'/5'/0'/0/" + (this.props.addresses.length + (i - 1)))
					.privateKey.toAddress()
					.toString()
			)
		}
		var remainingAddress = xpriv
			.derive("m/44'/5'/0'/0/" + (this.props.addresses.length + (denominations - 1)))
			.privateKey.toAddress()
			.toString()
		this.addOutput(
			'Creating ' +
				denominations +
				' new denominations, keeping any changes on new fresh address: ' +
				remainingAddress
		)
		this.setState({
			targetAddresses: existingDenominationAddresses.concat(denominationAddresses),
			destinationAddress: denominationAddresses,
			amountToSend: SupportedDenominationAmount * denominations,
			mode: 'denominations',
		})
		this.addNextAddressWithUnspendFundsToRawTx(
			this.getAddressesWithUnspendFunds(true),
			0,
			remainingAddress,
			0,
			[],
			[],
			[]
		)
	}
	waitForMixing = () => {
		this.setState({ mode: 'waitForMixing' })
		var component = this
		this.mixInterval = setInterval(() => component.mixCheck(), 10000)
	}
	getAlreadyExistingDenominations = () => {
		var addresses = []
		for (var key of Object.keys(this.props.addressBalances))
			if (this.props.addressBalances[key] === SupportedDenominationAmount) addresses.push(key)
		return addresses
	}
	getMixingInputs = async () => {
		if (this.state.inputs) return this.state.inputs
		var promises = []
		for (var key of Object.keys(this.props.addressBalances))
			if (this.props.addressBalances[key] === SupportedDenominationAmount)
				promises.push(
					fetch('https://insight.dash.org/insight-api/addr/' + key + '/utxo', {
						mode: 'cors',
						cache: 'no-cache',
					})
						.then(response => response.json())
						.then(utxos => {
							// only include single utxo, there shouldn't be more on a denomination address
							if (utxos && utxos.length === 1)
								return utxos[0]['txid'] + '|' + utxos[0]['vout'] + '|'
							else return ''
						})
				)
		var inputs = await Promise.all(promises)
		this.setState({ inputs: inputs })
		return inputs
	}
	//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	shuffle = array => {
		if (!array) return []
		var currentIndex = array.length,
			temporaryValue,
			randomIndex
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex -= 1
			temporaryValue = array[currentIndex]
			array[currentIndex] = array[randomIndex]
			array[randomIndex] = temporaryValue
		}
		return array
	}
	mixCheck = () => {
		var component = this
		this.getMixingInputs().then(inputs => {
			var targetAddresses = component.shuffle(component.state.targetAddresses)
			fetch(apiUrl + 'waitForP2PMixingPartners', {
				mode: 'cors',
				cache: 'no-cache',
				method: 'POST',
				body: JSON.stringify({
					inputs: inputs.join(''),
					denominationAddresses: targetAddresses,
				}),
				headers: { 'Content-Type': 'application/json' },
			})
				.then(component.handleErrors)
				.then(data => {
					var txHashes = data['txHashes']
					var txOutputIndexToUse = data['txOutputIndexToUse']
					var rawTx = data['rawTx']
					if (rawTx) {
						component.addOutput(
							'Found mixing partners, will sign randomly assigned denominations in this raw transaction: ' +
								rawTx
						)
						try {
							if (!txHashes || !txOutputIndexToUse) {
								component.addOutput("Incomplete transaction data, can't continue mixing round")
								return
							}
							var transaction = new Transaction()
							component.updateTxFee(txHashes.length, txHashes.length)
							transaction.fee(Math.round(txFee * 100000000))
							for (var i = 0; i < txHashes.length; i++) {
								var inputTransaction = new Transaction(txHashes[i])
								// Recreate utxo from existing data, address is not needed, output index is obviously important
								var utxo = {
									txId: inputTransaction.hash,
									outputIndex: txOutputIndexToUse[i],
									script: inputTransaction.outputs[txOutputIndexToUse[i]].script,
									satoshis: inputTransaction.outputs[txOutputIndexToUse[i]].satoshis,
								}
								transaction.from(utxo)
							}
							var rawTransaction = new Transaction(rawTx)
							for (var index = 0; index < rawTransaction.outputs.length; index++)
								transaction.addOutput(rawTransaction.outputs[index])
							transaction = transaction.sign(component.getDashHDWalletPrivateKeys())
							console.log(transaction.toObject())
							fetch(apiUrl + 'sendSignedMixingOnceDone', {
								mode: 'cors',
								cache: 'no-cache',
								method: 'POST',
								body: JSON.stringify({
									fee: transaction.fee,
									hash: transaction.hash,
									version: transaction.version,
									nLockTime: transaction.nLockTime,
									rawTx: transaction.toString(),
								}),
								headers: { 'Content-Type': 'application/json' },
							})
								.then(component.handleErrorsText)
								.then(doneTx => {
									component.addOutput('Mixing done: ' + component.getTransactionLink(doneTx))
									clearInterval(component.mixInterval)
								})
								.catch(function(serverError) {
									component.addOutput(
										'Failed to create partially mixed tx: ' + (serverError.message || serverError)
									)
								})
						} catch (e) {
							component.addOutput('Mix tx error: ' + e.toString())
						}
					} else if (data['error'])
						component.addOutput('Failed to create mixing transaction: ' + data['error'])
					else
						component.addOutput(
							'Still waiting for P2P mixing partners (need at least 3), will try again in 10s ...'
						)
				})
				.catch(function(serverError) {
					component.addOutput(
						'Failed to wait for mixing partners: ' + (serverError.message || serverError)
					)
				})
		})
	}
	render() {
		return (
			<div>
				<h1>Experimental Decentralized Mixing</h1>
				<div>
					<span style={{ color: 'indianred' }}>World First (Aug 2019)</span>: Mix directly in your
					browser, currently in test-mode, only for 10 mDASH amounts right now and limited to 10
					mixings per user.
				</div>
				<br />
				<ul>
					<li>
						Step 1: Unlock your HD Wallet
						<br />
						Hardware Wallets also work soon, but they require you to sign each mixing round
					</li>
					<li>Step 2: Enter the amount to mix, currently minimum 10 mDASH, maximum 100 mDASH</li>
					<li>Step 3: Watch the mixing progress in the textbox below</li>
					<li>
						You can walk away, stop at any point and all the funds remain in your wallet at all
						times
					</li>
					<li>Mixing can only complete when other users are available, it will take some time</li>
				</ul>
				<a href="https://old.mydashwallet.org/Mixing">
					Check our old site for unlimited PrivateSend mixing (not decentralized, but 100%
					automated)
				</a>
				<br />
				<br />
				<br />
				{this.props.isWalletAvailable && this.getAddressesWithUnspendFunds().length > 0 ? (
					<div>
						<label>Amount in mDASH (min 10, max 100):</label>
						<input
							style={{ width: '40%', margin: '10px' }}
							type="number"
							value={this.state.amountMDash}
							onChange={e => this.setState({ amountMDash: e.target.value })}
						/>
						<button
							onClick={() => {
								var newValue = parseInt(this.state.amountMDash / 10)
								if (newValue < 1) newValue = 1
								if (newValue > 10) newValue = 10
								newValue = newValue * 10
								this.setState({
									amountMDash: newValue,
									error: 'Amount to mix: ' + newValue + ' mDASH',
								})
								if (this.props.totalBalance < (newValue + 0.1) / 1000)
									this.insufficientFundsDialog.show()
								else if (this.getAddressesWithUnspendFunds().length === 0)
									this.addOutput(
										'Unable to start mixing, no address balances available, please refresh your wallet first by clicking on Wallet in the menu!'
									)
								else {
									this.startDialog.show()
									if (this.passwordInput) this.passwordInput.focus()
								}
							}}
						>
							Start
						</button>
					</div>
				) : (
					<h3>
						To get started please{' '}
						<Link to="/" onClick={() => this.props.setMode('')}>
							unlock your wallet to refresh txs
						</Link>
						!
					</h3>
				)}
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.insufficientFundsDialog = ref)}
					title="Insufficient Funds, can't start mixing"
				>
					<br />
					You need {this.state.amountMDash} + 0.1 mDASH collateral fees ={' '}
					{(this.state.amountMDash + 0.1) / 1000} DASH to start this mix session.
					<br />
					<br />
					Please lower your mixing amount or add more funds to your{' '}
					<Link to="/" onClick={() => this.props.setMode('')}>
						Wallet
					</Link>
					.
					<br />
					<br />
					<button onClick={() => this.insufficientFundsDialog.hide()}>Ok</button>
				</SkyLight>
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.startDialog = ref)}
					title="Start Decentralized Mixing"
				>
					<br />
					To start enter your password to send the 0.1 mDASH Collateral for transaction costs.
					<input
						type="password"
						autoFocus={true}
						ref={c => (this.passwordInput = c)}
						value={this.state.password}
						onChange={e => this.setState({ password: e.target.value })}
						onKeyDown={e => {
							if (e.keyCode === 13) this.sendCollateralAndCreateDenominations()
						}}
					/>
					<br />
					{this.state.error}
					<br />
					<br />
					This feature is experimental and limited to small amounts. Support our{' '}
					<a
						href="https://app.dashnexus.org/proposals/mydashwallet-development-stress-test-decentralized-mixing/overview"
						target="_blank"
						rel="noopener noreferrer"
					>
						proposal
					</a>{' '}
					to fund further development. 10 mDASH denominations are created locally and mixed p2p.
					<br />
					<br />
					<button onClick={() => this.sendCollateralAndCreateDenominations()}>Start Mixing</button>
				</SkyLight>
				Mixing Progress:
				<Output id="Output" dangerouslySetInnerHTML={{ __html: this.state.mixingOutput }} />
				<br />
				<br />
				<br />
				<br />
				<h4>Technical Implementation Details (work in progress)</h4>
				It is important to note that we have experimented with this idea since early 2019, but
				things are never straight forward in crypto and even when things work in testnet, it gets
				much more complex on mainnet. Especially trying to do things in a decentralized matter and
				waiting for features to go live made this a very complicated task. Thanks to InstantSend for
				all transactions and Chainlocks in 0.14+ going live a month ago, it finally opened the door
				to try some of these ideas live on mainnet :)
				<ul>
					<li>
						If you are concerned about battery life, close this tab and return later to try with new
						mixing partners.
					</li>
				</ul>
				<br />
				<br />
				From early <a href="https://bitcointalk.org/index.php?topic=279249.0">
					CoinJoin ideas
				</a>{' '}
				back in{' '}
				<a href="https://bitcointalk.org/index.php?topic=281848.0">
					2013 discussions on bitcointalk.org
				</a>
				: The users connect and provide inputs (and change addresses) and a
				cryptographically-blinded version of the address they want their private coins to go to; the
				server signs the tokens and returns them. The users anonymously reconnect, unblind their
				output addresses, and return them to the server. The server can see that all the outputs
				were signed by it and so all the outputs had to come from valid participants. Later people
				reconnect and sign.
				<br />
				<br />
				Note that the <a href="https://wasabiwallet.io/">Wasabi wallet</a> works very similar for
				Bitcoin. Here we use the same denominations from Dash PrivateSend and can use very cheap
				fees to keep the transaction costs below 1 cent for a mixing round (with PrivateSend mixing
				transactions it would be mostly free, but see below, currently not possible).
				<ul>
					<li>
						Basically user A tells server 10mDash public keys and randomized blinded encrypted
						target addresses (no one can decrypt them except the sender)
					</li>
					<li>User B and user C do the same (minimum we need 3x for each mixing)</li>
					<li>
						Server waits until enough inputs are available and connected (must be in the last 300s,
						clients need to resent)
					</li>
					<li>
						When ready, server now contacts all clients with all of the server signatures the
						blinded target addresses (randomized again)
					</li>
					<li>
						Clients unblind the target addresses by verifying the server signature and send them to
						the server
					</li>
					<li>
						Server has all target addresses (but doesn't know which belongs to who) and creates raw
						transaction
					</li>
					<li>
						This again is send to all clients to sign with their keys (which in effects sends their
						denomination once broadcast)
					</li>
					<li>
						e.g.{' '}
						<a href="https://bitcoin.stackexchange.com/questions/28089/how-do-i-ensure-that-the-multisig-transaction-thats-signed-by-multiple-parties">
							https://bitcoin.stackexchange.com/questions/28089/how-do-i-ensure-that-the-multisig-transaction-thats-signed-by-multiple-parties
						</a>
					</li>
					<li>Once finished, server broadcasts fully signed multisig, mixing round is done</li>
					<li>
						If anything fails, the broadcast simply won't happen (can't send partially signed tx).
						If you see an incoming tx getting signed by you, but no final broadcasted transaction
						ever comes it means some of the other mixing partners did not sign, the process will
						automatically find new partners.
					</li>
				</ul>
				<br />
				Currently the system cannot utilize the PrivateSend functionality from full Dash Nodes
				speaking to the Masternodes as none of this is exposed and usable for thin, spv or rpc
				clients. We have some test code and tried modifying one of our testdash nodes to utilize
				some features, but this is still a lot of work to get right. With more work things can be
				integrated more nicely in the near future.
				<ul>
					<li>
						For compatibility reasons the generateTx and signTx api calls from old.mydashwallet.org
						are still used (plus a few similar calls to process p2p signing to make this work until
						we can properly connect clients asynchrony), the first one can be replaced with local
						javascript code once our explorer returns the needed utxo details. The second one can
						also utilize the empty dash node used for the{' '}
						<a href="https://github.com/DeltaEngine/insight-api">
							explorer (which is also open source)
						</a>
					</li>
					<li>
						The code is also not refactored in a reusable pattern and there is a few weeks of
						cleanup work and library creation needed to make it into a nice reusable package
					</li>
					<li>
						The code is currently also not very clever and doesn't track the amount of mixing rounds
						(it can be calculated from the explorer api, but this is very costly, especially for
						many rounds)
					</li>
					<li>
						Currently the mixing doesn't respect already mixed inputs and will mix them over and
						over again when using this site (including creating new denominations when they are
						already good), it will get more clever in the future
					</li>
				</ul>
			</div>
		)
	}
}
