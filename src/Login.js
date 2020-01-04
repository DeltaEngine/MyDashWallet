import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import AppBtc from '@ledgerhq/hw-app-btc'
import TrezorConnect from 'trezor-connect'
import SkyLight from 'react-skylight'
import styled from 'styled-components'
import { Mnemonic } from '@dashevo/dashcore-lib'

const UnlockBlock = styled.div`
	float: left;
	width: 40%;
	min-width: 230px;
`
const HelpBlock = styled.div`
	float: right;
	width: 60%;
	@media screen and (max-width: 850px) {
		float: left;
		width: 100%;
	}
`
const LoginButton = styled.div`
	color: #fff;
	background-color: #1c75bc;
	cursor: pointer;
	display: inline-block;
	font-weight: bold;
	font-size: 18px;
	margin-bottom: 0;
	text-align: center;
	-ms-touch-action: manipulation;
	touch-action: manipulation;
	vertical-align: middle;
	white-space: nowrap;
	padding: 15px 20px;
	border-radius: 0;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	min-width: 228px;
	height: 94px;
	padding-top: 30px;
`

export class Login extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loginMode: 'Login',
			password: '',
			passwordAgain: '',
			seed: '',
			agree: false,
			helpExpanded: 0,
		}
	}
	componentWillMount() {
		document.body.style.backgroundImage = "url('/images/BackgroundWalletIllustration.png')"
	}
	componentWillUnmount() {
		document.body.style.backgroundImage = null
	}
	setError = message => {
		this.setState({
			walletMessage: message,
			walletMessageColor: 'red',
		})
	}
	loginWalletClick = () => {
		if (this.state.password.length < 8) this.setError('Please enter your password.')
		else this.setState({ walletMessage: this.props.onLoginWallet(this.state.password) })
	}
	createWalletClick = () => {
		if (this.state.seed.length < 12 || this.state.seed.split(' ').length !== 12)
			this.setError('Please enter a 12 word HD wallet seed')
		else if (this.state.password !== this.state.passwordAgain)
			this.setError('Please enter the same password twice')
		else if (!this.state.agree) this.setError('Please agree to the terms of use')
		else {
			this.walletDialog.hide()
			this.showSeedDialog.show()
		}
	}
	isAllDataValid = () => {
		if (!this.props.username || this.state.password.length < 8) return false
		if (this.state.loginMode === 'Register') {
			if (!this.state.agree || this.state.password !== this.state.passwordAgain) return false
		}
		return true
	}
	initializeLedger = () => {
		this.setState({ ledgerMessage: 'Unlock your device and go to the Dash app!' })
		this.ledgerDialog.show()
		TransportU2F.create()
			.then(async transport => {
				this.props.onLoginHardwareWallet(new AppBtc(transport), undefined)
				this.ledgerDialog.hide()
			})
			.catch(error => this.setState({ ledgerMessage: 'Error: ' + error.message }))
	}
	initializeTrezor = () => {
		this.setState({
			trezorMessage:
				"Please connect your Trezor Hardware Wallet and follow the instructions in the popup window (allow popup windows for this site). Check the 'Don't ask me again' checkbox, then your Export Dash Account when asked.",
		})
		this.trezorDialog.show()
		TrezorConnect.cancel()
		TrezorConnect.manifest({
			email: 'support@mydashwallet.org',
			appUrl: 'https://mydashwallet.org',
		})
		//https://github.com/trezor/connect/blob/develop/docs/methods/getAccountInfo.md
		TrezorConnect.getAccountInfo({
			path: "m/44'/5'/0'/0",
			coin: 'dash',
		}).then(result => {
			if (result.success) {
				this.props.onLoginHardwareWallet(undefined, result.payload)
				this.trezorDialog.hide()
			} else this.setState({ trezorMessage: 'Error: ' + result.payload.error })
		})
	}
	createWallet = restore => {
		this.setState({
			walletMessage: this.props.isWalletAvailable
				? 'Enter your password to unlock your wallet'
				: "Make sure your device is safe & no one is watching, don't show this to anyone.",
			walletMessageColor: 'black',
			seed: this.props.isWalletAvailable || restore ? '' : new Mnemonic().toString(),
			password: '',
			passwordAgain: '',
		})
		this.walletDialog.show()
		this.passwordInput.focus()
	}
	render() {
		return (
			<div>
				<UnlockBlock>
					<h1>Open Wallet</h1>
					<div data-i18n="HardwareSafestOption" style={{ fontSize: 'small', marginBottom: '4px' }}>
						Hardware wallets are the safest option via{' '}
						<a href="https://en.wikipedia.org/wiki/Universal_2nd_Factor">
							Chrome <span data-i18n="Or">or</span> Opera
						</a>
					</div>
					<LoginButton
						onClick={() => {
							this.setState({ loginMode: 'Ledger' })
							this.initializeLedger()
						}}
					>
						<img src="/images/LedgerButton.png" alt="Ledger" title="Ledger" />
					</LoginButton>
					<SkyLight
						dialogStyles={this.props.popupDialog}
						hideOnOverlayClicked
						ref={ref => (this.ledgerDialog = ref)}
						title="Connecting to Ledger Wallet"
					>
						<br />
						{this.state.ledgerMessage}
					</SkyLight>
					<br />
					<LoginButton
						onClick={() => {
							this.setState({ loginMode: 'Trezor' })
							this.initializeTrezor()
						}}
					>
						<img src="/images/TrezorButton.png" alt="Trezor" title="Trezor" />
					</LoginButton>
					<SkyLight
						dialogStyles={this.props.popupDialog}
						hideOnOverlayClicked
						ref={ref => (this.trezorDialog = ref)}
						title="Connecting to Trezor Wallet"
					>
						<br />
						{this.state.trezorMessage}
					</SkyLight>
					<br />
					<div style={{ fontSize: 'small', marginBottom: '4px' }}>
						Create or open HD Wallets in your browser locally.
					</div>
					<LoginButton
						style={{ paddingTop: '0' }}
						onClick={() => {
							this.setState({ loginMode: 'Wallet' })
							this.createWallet()
						}}
					>
						{!this.props.isWalletAvailable && (
							<div style={{ fontSize: '55px', fontWeight: 'normal', float: 'left' }}>+</div>
						)}
						{this.props.isWalletAvailable ? (
							<div style={{ marginTop: '34px' }}>Open HD Wallet</div>
						) : (
							<div style={{ marginTop: '34px' }}>Create HD Wallet</div>
						)}
					</LoginButton>
					<br />
					<br />
					<LoginButton
						style={{ paddingTop: '0' }}
						onClick={() => {
							this.setState({ loginMode: 'Wallet', restore: true })
							this.createWallet(true)
						}}
					>
						<div style={{ marginTop: '34px' }}>Restore from Seed</div>
					</LoginButton>
					<br />
					<span style={{ fontSize: 'small' }}>
						Private key and File imports are available on the{' '}
						<a href="https://old.mydashwallet.org">Old Website</a>
					</span>
					<SkyLight
						dialogStyles={this.props.popupDialog}
						hideOnOverlayClicked
						ref={ref => (this.walletDialog = ref)}
						title={
							this.props.isWalletAvailable
								? 'Enter password to unlock wallet'
								: this.state.restore
								? 'Restore HD Wallet from Seed'
								: 'Create HD Wallet'
						}
					>
						<a style={{ float: 'right' }} href="/help" target="_blank" rel="noopener noreferrer">
							Help
						</a>
						<br />
						<span style={{ color: this.state.walletMessageColor }}>{this.state.walletMessage}</span>
						{!this.props.isWalletAvailable && (
							<div>
								<br />
								<br />
								{this.state.restore
									? 'Enter your 12 word HD Wallet Seed you want to import'
									: 'Locally generated HD Wallet Seed'}
								<br />
								<input
									type="text"
									style={{ width: '100%', fontWeight: 'bold' }}
									value={this.state.seed}
									onChange={e => this.setState({ seed: e.target.value })}
								/>
								<br />
								<br />
								Protect with a password (minimum 8 characters).
							</div>
						)}
						<input
							autoFocus={true}
							type="password"
							ref={c => (this.passwordInput = c)}
							value={this.state.password}
							onChange={e => this.setState({ password: e.target.value })}
							onKeyDown={e => {
								if (e.keyCode === 13 && this.props.isWalletAvailable) this.loginWalletClick()
							}}
						/>
						<br />
						{!this.props.isWalletAvailable && (
							<div>
								Repeat your password.
								<br />
								<input
									type="password"
									value={this.state.passwordAgain}
									onChange={e => this.setState({ passwordAgain: e.target.value })}
								/>
								<br />
							</div>
						)}
						<br />
						{!this.props.isWalletAvailable && (
							<div>
								<input
									type="checkbox"
									value={this.state.agree}
									onChange={e => this.setState({ agree: e.target.value })}
								/>{' '}
								I agree to the{' '}
								<a href="/help" target="_blank" rel="noopener noreferrer">
									Terms
								</a>{' '}
								and understand that I will only use this web wallet for small amounts like I carry
								around in my wallet. For anything serious use a hardware wallet!
								<br />
								<br />
							</div>
						)}
						{this.props.isWalletAvailable ? (
							<div>
								<button onClick={() => this.loginWalletClick()}>Unlock Wallet</button>
								<button
									style={{ float: 'right' }}
									onClick={() => this.deleteAreYouSureDialog.show()}
								>
									Delete Wallet
								</button>
							</div>
						) : (
							<button onClick={() => this.createWalletClick()}>Create Wallet</button>
						)}
					</SkyLight>
					<SkyLight
						dialogStyles={this.props.popupDialog}
						hideOnOverlayClicked
						ref={ref => (this.showSeedDialog = ref)}
						title="Write down your Seed!"
					>
						<br />
						Write down your seed on a piece of paper, password manager or usb stick and store it in
						a safe location. It will NEVER be displayed again and is the only way to restore your
						wallet on any supported HD Wallet app. Your seed is stored encrypted with your password
						locally in your browser, it can't be restored if you forget your password.
						<br />
						<br />
						<b>{this.state.seed}</b>
						<br />
						<br />
						<button
							onClick={() => {
								this.showSeedDialog.hide()
								try {
									this.setState({
										walletMessage: this.props.onCreateWallet(
											new Mnemonic(this.state.seed),
											this.state.password
										),
									})
								} catch (error) {
									this.walletDialog.show()
									this.setError('Failed to create HD Wallet from Seed: ' + error)
								}
							}}
						>
							Ok
						</button>
					</SkyLight>
					<SkyLight
						dialogStyles={this.props.popupDialog}
						hideOnOverlayClicked
						ref={ref => (this.deleteAreYouSureDialog = ref)}
						title="Delete your wallet from this browser"
					>
						<br />
						Are you sure? This will delete all data from this browser, you can still restore your
						wallet from your seed in any browser or HD wallet.
						<br />
						<br />
						<button
							onClick={() => {
								this.props.onLogout(true)
								this.walletDialog.hide()
								this.deleteAreYouSureDialog.hide()
							}}
						>
							YES
						</button>
						<button style={{ float: 'right' }} onClick={() => this.deleteAreYouSureDialog.hide()}>
							NO
						</button>
					</SkyLight>
				</UnlockBlock>
				<HelpBlock>
					<br />
					<br />
					<br />
					<br />
					<h3>Help</h3>
					<ul>
						<li>
							<Link to="/help" onClick={() => this.props.setMode('help')}>
								What is MyDashWallet.org?
							</Link>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions1"
								href="https://old.mydashwallet.org/AboutLedgerHardwareWallet"
							>
								How to send via Ledger hardware wallet
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions2"
								href="https://old.mydashwallet.org/AboutTrezorHardwareWallet"
							>
								How to send via TREZOR hardware wallet
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions3"
								href="https://old.mydashwallet.org/AboutHardwareWallets"
							>
								Get a hardware wallet
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions4"
								href="https://old.mydashwallet.org/AboutCreateNewWallet"
							>
								How to create a new wallet
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions5"
								href="https://old.mydashwallet.org/AboutMyDashWallet"
							>
								Why is MyDashWallet so fast? How does it work?
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions6"
								href="https://old.mydashwallet.org/AboutTransactionFees"
							>
								Why are DASH transactions so cheap on MyDashWallet?
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions7"
								href="https://old.mydashwallet.org/AboutInstantSend"
							>
								How to does DASH InstantSend work on MyDashWallet?
							</a>
						</li>
						<li>
							<a
								data-i18n="AboutImportantQuestions8"
								href="https://old.mydashwallet.org/AboutPrivateSend"
							>
								How to does DASH PrivateSend work on MyDashWallet?
							</a>
						</li>
					</ul>
				</HelpBlock>
			</div>
		)
	}
}
