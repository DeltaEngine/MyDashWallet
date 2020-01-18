import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import update from 'immutability-helper'
import { Balances } from './Balances'
import { SendDash } from './SendDash'
import { ReceiveDash } from './ReceiveDash'
import { Transactions } from './Transactions'
import { Mnemonic } from '@dashevo/dashcore-lib'
import SkyLight from 'react-skylight'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import * as send from './send.js'

export class LoggedIn extends Component {
	constructor(props) {
		super(props)
		this.state = {
			selectedCurrency: 'USD',
			addresses: props.addresses,
			transactions: [],
			skipInitialTransactionsNotifications: true,
			skipEmptyAddresses: true,
			password: props.rememberPassword || '',
			lastUnusedAddress:
				props.addresses && props.addresses.length > 0
					? props.addresses[props.addresses.length - 1]
					: '',
		}
		for (var address of props.addresses)
			if (this.isValidDashAddress(address)) props.addressBalances[address] = 0
		this.updatingBalanceController = new window.AbortController()
		var component = this
		this.skipInitialTxInterval = setTimeout(() => {
			component.setState({ skipInitialTransactionsNotifications: false })
		}, 3873)
		this.skipEmptyAddressesInterval = setTimeout(() => {
			// Only check empty old addresses after 1 minute, then they are not longer checked
			component.setState({ skipEmptyAddresses: false })
		}, 70000)
	}
	componentDidMount() {
		this.setAddressAndLookForLastUsedHdWalletAddress(this.props.addresses)
		this.fillTransactions(this.props.addresses)
		document.body.style.backgroundImage = "url('/images/BackgroundWalletIllustration.png')"
		if (
			!this.props.ledger &&
			!this.props.trezor &&
			this.props.totalBalance * this.props.priceUsd > 100
		)
			this.hdWalletTooMuchBalanceWarning.show()
	}
	componentWillUnmount() {
		document.body.style.backgroundImage = null
		clearInterval(this.skipInitialTxInterval)
		clearInterval(this.skipEmptyAddressesInterval)
		clearInterval(this.updateBalanceInterval)
		if (this.updatingBalanceController) this.updatingBalanceController.abort()
	}
	addTransaction = tx => {
		// If we already got this tx, there is nothing we need to do, new ones are just added on top
		for (var existingTx of this.state.transactions) if (existingTx.id === tx.id) return
		// Must be updated with state, see https://jsbin.com/mofekakuqi/7/edit?js,output
		this.setState(state => update(state, { transactions: { $push: [tx] } }))
		if (
			!this.state.skipInitialTransactionsNotifications &&
			tx.amountChange > 0 &&
			tx.amountChange !== this.lastAmountChange
		) {
			this.lastAmountChange = tx.amountChange
			NotificationManager.warning(
				'Incoming transaction',
				'+' + this.showDashNumber(tx.amountChange)
			)
		}
	}
	showDashNumber = amount => {
		return this.props.showNumber(amount, 8) + ' DASH'
	}
	fillTransactionFromAddress = address => {
		fetch('https://insight.dash.org/insight-api/txs/?address=' + address, {
			mode: 'cors',
			cache: 'no-cache',
		})
			.then(response => response.json())
			.then(data => {
				const txs = data.txs
				for (var index = 0; index < txs.length; index++) {
					const tx = txs[index]
					var time = new Date(tx['time'] * 1000)
					var amountChange = 0
					const vin = tx['vin']
					for (var i = 0; i < vin.length; i++)
						if (this.isOwnAddress(vin[i]['addr'], address))
							amountChange -= parseFloat(vin[i]['value'])
					const vout = tx['vout']
					for (var j = 0; j < vout.length; j++)
						if (this.isOwnAddress(vout[j]['scriptPubKey']['addresses'][0], address))
							amountChange += parseFloat(vout[j]['value'])
					this.addTransaction({
						id: tx.txid,
						amountChange: amountChange,
						time: time,
						confirmations: tx.confirmations,
						size: tx.size,
						fees: tx.fees,
						txlock: tx.txlock,
					})
				}
			})
	}
	isOwnAddress = (addressToCheck, sendAddress) => {
		if (addressToCheck === sendAddress) return true
		for (var i = 0; i < this.state.addresses.length; i++)
			if (addressToCheck === this.state.addresses[i]) return true
		return false
	}
	fillTransactions = addresses => {
		for (var address of addresses) this.fillTransactionFromAddress(address)
	}
	// Loops through all known Dash addresses and checks the balance and sums up to total amount we got
	balanceCheck = () => {
		for (var addressToCheck of Object.keys(this.props.addressBalances))
			if (this.isValidDashAddress(addressToCheck) && !this.skipOldEmptyAddresses(addressToCheck))
				this.updateAddressBalance(addressToCheck, this.props.addressBalances[addressToCheck])
	}
	skipOldEmptyAddresses = addressToCheck => {
		// With HD Wallets we will end up with tons of empty addresses from the beginning.
		// Those are usually empty (if the HD wallet is used properly), we can skip checking them
		// most of the time (still update them after like 1 minute just to make sure)
		if (this.state.skipEmptyAddresses) {
			// Only skip checking the initial addresses passed into here
			for (var i = 0; i < this.props.addresses.length - 2; i++)
				if (
					addressToCheck === this.props.addresses[i] &&
					this.props.addressBalances[addressToCheck] === 0
				)
					return true
		} else {
			// Reset after checking once (if there is any balance on an old address, it will included now)
			this.setState({ skipEmptyAddresses: false })
		}
		return false
	}
	isValidDashAddress = address => {
		return (
			address &&
			address.length >= 34 &&
			(address[0] === 'X' || address[0] === 'x' || address[0] === '7')
		)
	}
	updateAddressBalance = (addressToCheck, oldBalance) => {
		var component = this
		fetch('https://insight.dash.org/insight-api/addr/' + addressToCheck, {
			mode: 'cors',
			cache: 'no-cache',
			signal: this.updatingBalanceController.signal,
		})
			.then(response => response.json())
			.then(data => {
				if (data && !isNaN(data.balance)) {
					var newBalance = parseFloat(data.balance)
					if (!isNaN(data.unconfirmedBalance)) newBalance += parseFloat(data.unconfirmedBalance)
					var rememberToUpdateTotalAmount =
						newBalance < 1000 && component.props.addressBalances[addressToCheck] !== newBalance
					if (!oldBalance || newBalance !== oldBalance) {
						if (oldBalance && oldBalance > 0)
							console.log('Updating balance of ' + addressToCheck + ': ' + newBalance)
						// Exclude any masternode amounts
						if (newBalance < 1000) component.props.addressBalances[addressToCheck] = newBalance
						if (component.props.addressBalances[addressToCheck] < send.DUST_AMOUNT_IN_DASH)
							component.props.addressBalances[addressToCheck] = 0
					}
					// This is the last address in our list? And it has received something, then add the next one at the end
					var lastUnusedAddress = this.state.addresses[this.state.addresses.length - 1]
					//var lastUsedAddress = this.state.addresses.length > 1 ? this.state.addresses[this.state.addresses.length - 2] : lastUnusedAddress
					if (
						addressToCheck === lastUnusedAddress &&
						(newBalance > 0 || parseFloat(data.totalReceived) > 0)
					) {
						if (this.props.trezor) {
							//not needed in wallet mode, horrible user experience having to confirm each address, we have all addresses already for trezor!
						} else if (this.props.ledger) {
							this.props.ledger
								.getWalletPublicKey("44'/5'/0'/0/" + this.state.addresses.length)
								.then(function(result) {
									component.addLastAddress(result.bitcoinAddress)
									component.updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses()
								})
						} else if (this.state.password) {
							var hdS = this.props.onDecrypt(this.props.hdSeedE, this.state.password)
							if (hdS !== '') {
								var mnemonic = new Mnemonic(hdS)
								var xpriv = mnemonic.toHDPrivateKey()
								lastUnusedAddress = xpriv
									.derive("m/44'/5'/0'/0/" + component.state.addresses.length)
									.privateKey.toAddress()
									.toString()
								component.addLastAddress(lastUnusedAddress)
								rememberToUpdateTotalAmount = true
							}
						} else if (this.showPasswordDialog) {
							this.showPasswordDialog.show()
						}
						if (rememberToUpdateTotalAmount)
							component.updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses()
					}
				}
			})
			.catch(error => console.log(error))
	}
	addLastAddress = lastAddress => {
		var addresses = this.state.addresses
		addresses.push(lastAddress)
		this.props.addressBalances[lastAddress] = 0
		this.setState({ addresses: addresses, lastUnusedAddress: lastAddress })
		return addresses
	}
	updateLocalStorageBalances = () => {
		var totalAmount = 0
		var cachedText = ''
		for (var key of Object.keys(this.props.addressBalances))
			if (this.isValidDashAddress(key)) {
				var amount = this.props.addressBalances[key]
				totalAmount += amount
				cachedText += key + '|' + amount + '|'
			}
		localStorage.setItem('addressBalances', cachedText)
		return totalAmount.toFixed(8)
	}
	updateLocalStorageBalancesAndRefreshTotalAmountAndReceivingAddresses = () => {
		var totalAmount = this.updateLocalStorageBalances()
		if (this.props.totalBalance !== totalAmount) {
			if (totalAmount > this.props.totalBalance)
				NotificationManager.info(
					'Successfully updated balance: ' + this.showDashNumber(totalAmount)
				)
			this.props.onUpdateBalanceAndAddressesStorage(
				totalAmount,
				Object.keys(this.props.addressBalances)
			)
		}
		this.fillTransactions(Object.keys(this.props.addressBalances))
	}
	setAddressAndLookForLastUsedHdWalletAddress = addresses => {
		if (this.props.trezor) {
			for (var used of this.props.trezor.usedAddresses)
				this.updateAddressBalance(used.address, this.props.addressBalances[used.address])
			var balance = this.props.trezor.balance * send.DASH_PER_DUFF
			if (balance > this.props.totalBalance)
				NotificationManager.info('Successfully updated balance: ' + this.showDashNumber(balance))
			this.props.onUpdateBalanceAndAddressesStorage(
				balance,
				Object.keys(this.props.addressBalances)
			)
			for (var tx of this.props.trezor.utxo)
				this.fillTransactionFromId(tx.transactionHash, tx.index)
			return
		}
		// Check if we were on this address the last time too, then we can use cached data
		var compressedCachedAddressBalances = localStorage.getItem('addressBalances')
		//https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
		var firstAddress = addresses[0]
		// Was cached and still on the same wallet as last time? Then restore all known address balances
		if (compressedCachedAddressBalances) {
			var parts = compressedCachedAddressBalances.split('|')
			if (firstAddress === parts[0]) {
				for (var i = 0; i < parts.length / 2; i++)
					if (parts[i * 2].length > 0)
						this.props.addressBalances[parts[i * 2]] = parseFloat(parts[i * 2 + 1])
			}
		}
		var component = this
		this.updateBalanceInterval = setInterval(() => component.balanceCheck(), 3000)
	}
	fillTransactionFromId = (txId, txIndex) => {
		if (txId)
			fetch('https://insight.dash.org/insight-api/tx/' + txId, {
				mode: 'cors',
				cache: 'no-cache',
			})
				.then(response => response.json())
				.then(tx => {
					var time = new Date(tx['time'] * 1000)
					var amountChange = parseFloat(tx.vout[txIndex]['value'])
					this.addTransaction({
						id: txId,
						amountChange: amountChange,
						time: time,
						confirmations: tx.confirmations,
						size: tx.size,
						fees: tx.fees,
						txlock: tx.txlock,
					})
				})
	}
	getUnusedAddress = () => {
		var lastAddress = this.state.addresses[this.state.addresses.length - 1]
		var amountOnLastAddress = this.props.addressBalances[lastAddress]
		// We need a new fresh address
		if (amountOnLastAddress > 0) {
			var component = this
			if (this.props.trezor) {
				component.addLastAddress(this.props.trezor.unusedAddresses[1])
			} else if (this.props.ledger) {
				this.props.ledger
					.getWalletPublicKey("44'/5'/0'/0/" + this.state.addresses.length)
					.then(function(result) {
						var addresses = component.addLastAddress(result.bitcoinAddress)
						component.props.onUpdateBalanceAndAddressesStorage(
							component.props.totalBalance,
							addresses
						)
					})
			} else if (this.state.password && this.state.password.length >= 8 && this.props.hdSeedE) {
				var hdS = this.props.onDecrypt(this.props.hdSeedE, this.state.password)
				if (hdS === '')
					return 'Unable to obtain unused address, the wallet seed cannot be reconstructed!'
				var mnemonic = new Mnemonic(hdS)
				var xpriv = mnemonic.toHDPrivateKey()
				lastAddress = xpriv
					.derive("m/44'/5'/0'/0/" + this.state.addresses.length)
					.privateKey.toAddress()
					.toString()
				var addresses = this.addLastAddress(lastAddress)
				this.props.onUpdateBalanceAndAddressesStorage(this.props.totalBalance, addresses)
			} else {
				this.showPasswordDialog.show()
			}
		}
		return lastAddress
	}
	getSelectedCurrencyDashPrice = () => {
		return this.state.selectedCurrency === 'EUR'
			? this.props.priceEur
			: this.state.selectedCurrency === 'GBP'
			? this.props.priceGbp
			: this.props.priceUsd
	}
	getPrivateSendBalance = () => {
		var mixedAmount = 0
		for (var key of Object.keys(this.props.addressBalances)) {
			var amount = this.props.addressBalances[key]
			// check for supported denominations
			if (
				amount === 0.00100001 ||
				amount === 0.0100001 ||
				amount === 0.100001 ||
				amount === 1.00001 ||
				amount === 10.0001
			)
				mixedAmount += amount
		}
		return mixedAmount.toFixed(8)
	}
	render() {
		return (
			<div id="main" className="main_dashboard_otr">
				<h1>{this.props.unlockedText}</h1>
				<Balances
					totalBalance={this.props.totalBalance}
					privateSendBalance={this.getPrivateSendBalance()}
					showNumber={this.props.showNumber}
					getSign={this.getSign}
					setMode={this.props.setMode}
					getSelectedCurrencyDashPrice={this.getSelectedCurrencyDashPrice}
					selectedCurrency={this.state.selectedCurrency}
					setSelectedCurrency={value => this.setState({ selectedCurrency: value })}
				/>
				<SendDash
					popupDialog={this.props.popupDialog}
					addressBalances={this.props.addressBalances}
					hdSeedE={this.props.hdSeedE}
					getSelectedCurrencyDashPrice={this.getSelectedCurrencyDashPrice}
					selectedCurrency={this.state.selectedCurrency}
					isCorrectPasswordHash={this.props.isCorrectPasswordHash}
					getUnusedAddress={this.getUnusedAddress}
					totalBalance={this.props.totalBalance}
					addresses={this.state.addresses}
					showNumber={this.props.showNumber}
					showDashNumber={this.showDashNumber}
					onDecrypt={this.props.onDecrypt}
					addTransaction={this.addTransaction}
					setRememberedPassword={rememberPassword => this.setState({ password: rememberPassword })}
					isValidDashAddress={this.isValidDashAddress}
					onUpdateBalanceAndAddressesStorage={this.props.onUpdateBalanceAndAddressesStorage}
					setNewTotalBalance={newBalance =>
						this.props.onUpdateBalanceAndAddressesStorage(newBalance, this.state.addresses)
					}
				/>
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.showPasswordDialog = ref)}
					title="Enter your HD Wallet password"
				>
					<br />
					Your password is required to login and generate your next HD wallet address
					<input
						type="password"
						autoFocus={true}
						style={{ borderBottom: '1px solid gray', fontSize: '16px' }}
						value={this.state.password}
						onChange={e => this.setState({ password: e.target.value })}
						onKeyDown={e => {
							if (e.keyCode === 13) {
								this.showPasswordDialog.hide()
								this.getUnusedAddress()
							}
						}}
					/>
					<br />
					<br />
					<button
						onClick={() => {
							this.showPasswordDialog.hide()
							this.getUnusedAddress()
						}}
					>
						Ok
					</button>
				</SkyLight>
				<SkyLight
					dialogStyles={this.props.popupDialog}
					hideOnOverlayClicked
					ref={ref => (this.hdWalletTooMuchBalanceWarning = ref)}
					title="Too many funds, use a hardware wallet!"
				>
					<br />
					You have too many funds on your HD Wallet in your browser. This is considered{' '}
					<Link to="/help" onClick={() => this.props.setMode('help')}>
						dangerous
					</Link>
					, only continue if you know what you are doing and are very careful.{' '}
					<a
						href="https://old.mydashwallet.org/AboutHardwareWallets"
						target="_blank"
						rel="noopener noreferrer"
					>
						Please consider using a hardware wallet
					</a>{' '}
					to protect your funds or simply split up your funds into long term storage and only keep a
					small amount here for daily use.
					<br />
					<br />
					<button onClick={() => this.hdWalletTooMuchBalanceWarning.hide()}>Ok</button>
				</SkyLight>
				<ReceiveDash
					lastUnusedAddress={this.state.lastUnusedAddress}
					addressBalances={this.props.addressBalances}
					reversedAddresses={this.state.addresses.slice().reverse()}
					showDashNumber={this.showDashNumber}
				/>
				<div style={{ clear: 'both', paddingTop: '20px' }}>
					<Transactions
						transactions={this.state.transactions}
						getSelectedCurrencyDashPrice={this.getSelectedCurrencyDashPrice}
						selectedCurrency={this.state.selectedCurrency}
						showDashNumber={this.showDashNumber}
						showNumber={this.props.showNumber}
					/>
					<NotificationContainer />
				</div>
			</div>
		)
	}
}
