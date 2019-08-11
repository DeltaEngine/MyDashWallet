import React, { Component } from 'react'
import { Menu } from './Menu'
import { Mix } from './Mix'
import { Tip } from './Tip'
import { Chat } from './Chat'
import { Stats } from './Stats'
import { Help } from './Help'
import { ScriptHack } from './ScriptHack'
import { LoggedIn } from './LoggedIn'
import { Login } from './Login'
import CryptoJS from 'crypto-js'
import { Mnemonic } from '@dashevo/dashcore-lib'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import './all.css'
import * as send from './send.js'
var addressBalances = {}

const PageContainer = styled.div`
	@media screen and (max-width: 1200px) {
		.register_mn_otr {
			position: relative;
		}
	}
`
const DashPricePanel = styled.div`
	color: #3778b9;
	-webkit-box-flex: 1;
	-webkit-flex: 1 auto;
	-ms-flex: 1 auto;
	text-align: right;
	display: -webkit-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: horizontal;
	-webkit-box-direction: normal;
	-webkit-flex-flow: row wrap;
	-ms-flex-flow: row wrap;
	flex-flow: row wrap;
	-webkit-box-pack: end;
	-webkit-justify-content: flex-end;
	-ms-flex-pack: end;
	justify-content: flex-end;
	-webkit-box-align: center;
	-webkit-align-items: center;
	-ms-flex-align: center;
	align-items: center;
	position: absolute;
	top: 0;
	right: 0;
	float: right;
	text-align: right;
	font-size: 13px;
	div {
		width: 75px;
		margin-top: 5px;
		margin-right: 10px;
	}
`
const MainContainer = styled.div`
	display: inline-block;
	vertical-align: middle;
	margin-left: -3px;
	width: ${props => (props.collapsed ? '86%' : props.isSmallScreen ? '97%' : '72%')};
	height: 100vh;
	padding-top: 30px;
	padding-left: 50px;
	padding-right: 40px;
	@media screen and (max-width: 1200px) {
		padding-left: 30px;
		padding-right: 20px;
	}
	@media screen and (max-width: 767px) {
		padding-left: 20px;
		padding-right: 0;
	}
`
const Loader = styled.div`
	border-radius: 50%;
	width: 10em;
	height: 10em;
	font-size: 10px;
	position: absolute;
	border-top: 1.1em solid rgba(0, 141, 228, 0.2);
	border-right: 1.1em solid rgba(0, 141, 228, 0.2);
	border-bottom: 1.1em solid rgba(0, 141, 228, 0.2);
	border-left: 1.1em solid #008de4;
	-webkit-transform: translateZ(0);
	-ms-transform: translateZ(0);
	transform: translateZ(0);
	-webkit-animation: load8 1.1s infinite linear;
	animation: load8 1.1s infinite linear;
	left: 55%;
	top: 40%;
	padding: 30px;
	padding-left: 25px;
`

export default class App extends Component {
	constructor(props) {
		super(props)
		var lastLoginTime = localStorage.getItem('lastLoginTime')
		var encryptedPasswordHash = localStorage.getItem('encryptedPasswordHash')
		var hdSeedE = localStorage.getItem('hdSeedE')
		var totalBalance = localStorage.getItem('totalBalance')
		var addresses = localStorage.getItem('addresses')
		var yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		// Max. keep cache 24 hours!
		if (
			lastLoginTime &&
			new Date(parseInt(lastLoginTime)) > yesterday &&
			encryptedPasswordHash &&
			hdSeedE &&
			totalBalance &&
			addresses
		)
			this.state = {
				priceUsd: 112.5,
				priceEur: 103.1,
				priceGbp: 97.1,
				priceBtc: 0.01,
				encryptedPasswordHash: encryptedPasswordHash,
				hdSeedE: hdSeedE,
				totalBalance: totalBalance,
				addresses: addresses.split(' '),
				loading: false,
				mode: this.getModeFromUrl(),
				collapsed: window.innerWidth < 768,
			}
		else
			this.state = {
				priceUsd: 112.5,
				priceEur: 103.1,
				priceGbp: 97.1,
				priceBtc: 0.01,
				totalBalance: 0,
				addresses: [],
				hdSeedE: hdSeedE, //allow login again from stored encrypted seed, password is unknown and must match hash
				mode: this.getModeFromUrl(),
				collapsed: window.innerWidth < 768,
			}
		window.onpopstate = () => {
			if (this.state.mode !== this.getModeFromUrl()) this.setMode(this.getModeFromUrl())
		}
		window.onpushstate = () => {
			if (this.state.mode !== this.getModeFromUrl()) this.setMode(this.getModeFromUrl())
		}
		/*will happen for too many users with adblockers on
		fetch('https://api.coinmarketcap.com/v1/ticker/dash?convert=EUR')
			.then(response => response.json())
			.then(data => {
				this.setState({
					priceUsd: data[0].price_usd,
					priceEur: data[0].price_eur,
					priceGbp: data[0].price_eur*0.89,
					priceBtc: data[0].price_btc,
				})
			}).catch(function () {
				*/
		// If coinmarketcap api was blocked by adblocker or is not longer responding prices, use fallback
		//https://stackoverflow.com/questions/54904517/coinmarketcap-api-blocked-by-adblock
		fetch('https://old.mydashwallet.org/getPrice', {
			mode: 'cors',
			cache: 'no-cache',
		})
			.then(response => response.json())
			.then(data => {
				this.setState({
					priceUsd: data.price_usd,
					priceEur: data.price_eur,
					priceGbp: data.price_gbp,
					priceBtc: data.price_btc,
				})
			})
		//})
		ReactGA.initialize('UA-25232431-3')
		ReactGA.pageview('/')
	}
	getModeFromUrl = () => {
		return window.location.href.endsWith('mix')
			? 'mix'
			: window.location.href.endsWith('tip') ||
			  window.location.href.endsWith('tipping') ||
			  window.location.href.endsWith('Tipping')
			? 'tip'
			: window.location.href.includes('chat')
			? 'chat'
			: window.location.href.endsWith('stats') || window.location.href.endsWith('statistics')
			? 'stats'
			: window.location.href.endsWith('help') || window.location.href.includes('about')
			? 'help'
			: window.location.href.endsWith('scripthack')
			? 'scripthack'
			: ''
	}
	setMode = newMode => {
		if (this.state.mode === newMode) return
		this.setState({ mode: newMode })
		if (!window.location.href.endsWith(newMode))
			window.history.replaceState(null, 'MyDashWallet - ' + newMode, newMode)
		ReactGA.pageview('/' + newMode)
	}
	loginWallet = password => {
		if (!this.state.hdSeedE) return 'No wallet available to unlock!'
		var encryptedPasswordHash = this.getEncryptedPasswordHash(password)
		var decrypted = this.decrypt(this.state.hdSeedE, password)
		if (!decrypted) return 'Invalid wallet password'
		var mnemonic = new Mnemonic(decrypted)
		var xpriv = mnemonic.toHDPrivateKey()
		var addresses = [
			xpriv
				.derive("m/44'/5'/0'/0/0")
				.privateKey.toAddress()
				.toString(),
		]
		this.setState({
			ledger: undefined,
			trezor: undefined,
			encryptedPasswordHash: encryptedPasswordHash,
			addresses,
			loading: false,
			mode: '',
			rememberPassword: password,
		})
		localStorage.setItem('lastLoginTime', new Date().getTime().toString())
		localStorage.setItem('encryptedPasswordHash', encryptedPasswordHash)
		localStorage.setItem('addresses', addresses.join(' '))
	}
	getEncryptedPasswordHash = password => {
		// The password is never stored, we derive it and only check if the hash is equal
		var passwordHash = this.deriveHash(password)
		return this.encrypt(passwordHash, '9ADE0896B2594184BA36E757C8E6EFD7')
	}
	deriveHash = password => {
		return CryptoJS.SHA256(password).toString()
	}
	encrypt = (text, key) => {
		try {
			var iv = CryptoJS.enc.Hex.parse('F2EBAE2CDF804895B5C091D0310169C9')
			var cfg = { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 }
			var ciphertext = CryptoJS.AES.encrypt(text, key, cfg)
			return ciphertext.toString()
		} catch (err) {
			console.log(err)
			return ''
		}
	}
	decrypt = (encryptedData, key) => {
		try {
			var iv = CryptoJS.enc.Hex.parse('F2EBAE2CDF804895B5C091D0310169C9')
			var cfg = { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 }
			var decrypted = CryptoJS.AES.decrypt(encryptedData, key, cfg)
			return decrypted.toString(CryptoJS.enc.Utf8)
		} catch (err) {
			console.log(err)
			return ''
		}
	}
	isCorrectPasswordHash = password => {
		return (
			this.deriveHash(password) ===
			this.decrypt(this.state.encryptedPasswordHash, '9ADE0896B2594184BA36E757C8E6EFD7')
		)
	}
	loginHardwareWallet = async (ledger, trezor) => {
		var addresses = []
		if (ledger) {
			const result = await ledger.getWalletPublicKey("44'/5'/0'/0/0")
			addresses.push(result.bitcoinAddress)
		} else {
			for (var used of trezor.usedAddresses) addresses.push(used.address)
			// Show first unused address, the rest (trezor.unusedAddresses) is used once this is used
			addresses.push(trezor.address)
		}
		this.setState({
			ledger,
			trezor,
			hdSeedE: 'h',
			encryptedPasswordHash: 'w',
			addresses,
			totalBalance: trezor ? trezor.balance * send.DASH_PER_DUFF : 0,
			loading: false,
			mode: '',
			rememberPassword: '',
		})
		localStorage.setItem('lastLoginTime', new Date().getTime().toString())
		localStorage.setItem('addresses', addresses.join(' '))
	}
	createWallet = (newSeed, password) => {
		var address = newSeed
			.toHDPrivateKey()
			.derive("m/44'/5'/0'/0/0")
			.privateKey.toAddress()
			.toString()
		var encryptedHdSeed = this.encrypt(newSeed.toString(), password)
		var encryptedPasswordHash = this.getEncryptedPasswordHash(password)
		this.setState({
			ledger: undefined,
			trezor: undefined,
			hdSeedE: encryptedHdSeed,
			encryptedPasswordHash: encryptedPasswordHash,
			totalBalance: 0,
			addresses: [address],
			loading: false,
			mode: '',
			rememberPassword: password,
		})
		localStorage.setItem('lastLoginTime', new Date().getTime().toString())
		localStorage.setItem('encryptedPasswordHash', encryptedPasswordHash)
		localStorage.setItem('hdSeedE', encryptedHdSeed)
		localStorage.setItem('totalBalance', 0)
		localStorage.setItem('addresses', address)
	}
	logout = deleteAll => {
		localStorage.removeItem('lastLoginTime')
		localStorage.removeItem('encryptedPasswordHash')
		if (deleteAll) {
			localStorage.removeItem('hdSeedE')
			addressBalances = {}
		}
		localStorage.removeItem('totalBalance')
		localStorage.removeItem('addresses')
		window.history.pushState({ urlPath: '/' }, '', '/')
		this.setState({
			encryptedPasswordHash: undefined,
			hdSeedE: deleteAll ? undefined : this.state.hdSeedE,
			mode: '',
			loading: false,
		})
	}
	//for reloading the page to still have all the data available next time
	updateBalanceAndAddressesStorage = (totalBalance, addresses) => {
		this.setState({ totalBalance, addresses })
		localStorage.setItem('lastLoginTime', new Date().getTime().toString())
		localStorage.setItem('totalBalance', totalBalance)
		localStorage.setItem('addresses', addresses.join(' '))
	}
	showNumber = (amount, decimals) => {
		var result
		if (decimals === 3) {
			result = parseFloat(Math.round(amount * 1000) / 1000).toFixed(decimals)
		} else if (decimals === 4) {
			result = parseFloat(Math.round(amount * 10000) / 10000).toFixed(decimals)
			// If we have more than 1 leading digits before the . remove the last digit after the dot
			if (result.length > 6 && amount > 0) result = result.substring(0, result.length - 1)
		} else if (decimals === 5) {
			result = parseFloat(Math.round(amount * 100000) / 100000).toFixed(decimals)
			// If we have more than 1 leading digits before the . remove the last digit after the dot
			if (result.length > 7 && amount > 0) result = result.substring(0, result.length - 1)
		} else if (decimals === 6)
			result = parseFloat(Math.round(amount * 1000000) / 1000000).toFixed(decimals)
		else if (decimals === 7)
			result = parseFloat(Math.round(amount * 10000000) / 10000000).toFixed(decimals)
		else if (decimals === 8)
			result = parseFloat(Math.round(amount * 100000000) / 100000000).toFixed(decimals)
		else result = parseFloat(amount).toFixed(decimals)
		// Always cut off the last bunch of zeros (except if we requested 2 decimals for currencies)
		if (decimals > 2)
			for (var i = 0; i < 9; i++) {
				var isDot = result.endsWith('.')
				if (result.endsWith('0') || isDot) {
					result = result.substring(0, result.length - 1)
					if (isDot) break
				} else break
			}
		if (result === '' || isNaN(result)) return 0
		return result
	}
	render() {
		if (window.location.href.includes('/mixing') || window.location.href.includes('/redeem')) {
			window.location.href = window.location.href.replace("https://mydashwallet.org", "https://old.mydashwallet.org")
			return <div />
		}
		var popupDialog = {
			position: 'absolute',
			textAlign: 'left',
			borderRadius: '8px',
			border: 'solid 1px #979797',
			width: '96%',
			maxWidth: '740px',
			height: 'auto',
			minHeight: 'auto',
			top: '5%',
			left: '24px',
			right: '4px',
			margin: '5% auto',
			padding: '24px',
			marginBottom: '50px',
		}
		return (
			<PageContainer>
				<Menu
					onLogout={this.logout}
					mode={this.state.mode}
					setMode={this.setMode}
					hardwareWallet={this.state.ledger || this.state.trezor}
					isUnlocked={this.state.hdSeedE && this.state.encryptedPasswordHash}
					setCollapsed={value => this.setState({ collapsed: value })}
				/>
				<MainContainer
					collapsed={this.state.collapsed || window.innerWidth < 768}
					isSmallScreen={window.innerWidth < 768}
				>
					{this.state.mode === 'mix' ? (
						<Mix
							popupDialog={popupDialog}
							addressBalances={addressBalances}
							addresses={this.state.addresses}
							showNumber={this.showNumber}
							setMode={this.setMode}
							totalBalance={this.state.totalBalance}
							onDecrypt={this.decrypt}
							isWalletAvailable={this.state.hdSeedE && this.state.encryptedPasswordHash}
							ledger={this.state.ledger}
							trezor={this.state.trezor}
							hdSeedE={this.state.hdSeedE}
							encryptedPasswordHash={this.state.encryptedPasswordHash}
							isCorrectPasswordHash={this.isCorrectPasswordHash}
						/>
					) : this.state.mode === 'tip' ? (
						<Tip />
					) : this.state.mode === 'chat' ? (
						<Chat />
					) : this.state.mode === 'stats' ? (
						<Stats />
					) : this.state.mode === 'help' ? (
						<Help />
					) : this.state.mode === 'scripthack' ? (
						<ScriptHack />
					) : this.state.hdSeedE && this.state.encryptedPasswordHash ? (
						<LoggedIn
							popupDialog={popupDialog}
							addressBalances={addressBalances}
							unlockedText={
								(this.state.trezor ? 'Trezor' : this.state.ledger ? 'Ledger' : 'HD Wallet') +
								' unlocked'
							}
							rememberPassword={this.state.rememberPassword}
							showNumber={this.showNumber}
							totalBalance={this.state.totalBalance}
							priceUsd={this.state.priceUsd}
							priceEur={this.state.priceEur}
							priceGbp={this.state.priceGbp}
							addresses={this.state.addresses}
							ledger={this.state.ledger}
							trezor={this.state.trezor}
							hdSeedE={this.state.hdSeedE}
							encryptedPasswordHash={this.state.encryptedPasswordHash}
							isCorrectPasswordHash={this.isCorrectPasswordHash}
							onDecrypt={this.decrypt}
							onEncrypt={this.encrypt}
							setMode={this.setMode}
							onUpdateBalanceAndAddressesStorage={this.updateBalanceAndAddressesStorage}
						/>
					) : (
						<Login
							popupDialog={popupDialog}
							isWalletAvailable={this.state.hdSeedE}
							setMode={this.setMode}
							isCorrectPasswordHash={this.isCorrectPasswordHash}
							onLoginWallet={this.loginWallet}
							onCreateWallet={this.createWallet}
							onLoginHardwareWallet={this.loginHardwareWallet}
							onLogout={this.logout}
						/>
					)}
					{this.state.loading && <Loader>DASH</Loader>}
				</MainContainer>
				<DashPricePanel>
					<div title="Data from CoinMarketCap.com">
						<b>1 DASH</b>
						<br />${this.showNumber(this.state.priceUsd, 2)}
						<br />€{this.showNumber(this.state.priceEur, 2)}
						<br />
						{window.innerWidth > 768 && <span>{this.showNumber(this.state.priceBtc, 4)} BTC</span>}
					</div>
					{window.innerWidth > 768 && (
						<div title="1 mDASH = 0.001 DASH. Data from CoinMarketCap.com">
							<b>1 mDASH</b>
							<br />${this.showNumber(this.state.priceUsd / 1000.0, 2)}
							<br />€{this.showNumber(this.state.priceEur / 1000.0, 2)}
							<br />
							Tx:${this.showNumber(this.state.priceUsd * 0.00000226, 5)}
						</div>
					)}
				</DashPricePanel>
			</PageContainer>
		)
	}
}
