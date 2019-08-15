import React, { Component } from 'react'

export class Tip extends Component {
	constructor(props) {
		super(props)
		this.state = { account: '' }
	}
	goToAccountOnEnter = event => {
		if (event.keyCode === 13)
			window.location.href =
				'https://old.mydashwallet.org/Account/' + this.state.account.replace('/u/', '')
	}
	render() {
		return (
			<div>
				<h1>Tipping Dash</h1>
				<span data-i18n="TippingOverview">
					MyDashWallet allows you to tip other people DASH directly on Twitter, Telegram, Discord,
					Reddit or via Email.
				</span>
				<br />
				<br />
				<b>You can tip anyone from any wallet</b> (not just from here or your own tipping account on
				Twitter, Reddit, Discord or Telegram). Like before any Tip Account has a Dash Address, we
				made it now super easy to find or create Dash Accounts for any social account. You can tip
				anyone you like and they will get a notification once they receive a tip.
				<br />
				<input
					value={this.state.account}
					onChange={e => this.setState({ account: e.target.value })}
					className="form-control"
					placeholder="@Twitter or @Discord#1234 or Name@Email.com or /u/RedditUser"
					style={{ width: '98%' }}
					onKeyUp={e => this.goToAccountOnEnter(e)}
				/>
				<br />
				<br />
				<span data-i18n="[html]TippingExplanation">
					Tip anyone directly from your <a href="/">unlocked wallet</a>: Instead of sending directly
					to an Dash address select one of the other options and send out your Dash, we will notify
					the receiver for you. Or simply write your tip (<b>Dash, mDASH, $, Usd, Euro</b> or even{' '}
					<b>Cookies</b> or <b>Beers</b>) in any of the supported platforms where we have bots
					running and listening:
				</span>
				<br />
				<br />
				<ul>
					<li data-i18n="[html]TippingTwitter">
						<b>
							<a href="https://twitter.com/hashtag/dash">Twitter</a>
						</b>
						: Mention <a href="https://twitter.com/MyDashWallet">@MyDashWallet</a> in your tweet
						reply and the amount you want to tip, for example:{' '}
						<pre>@MyDashWallet thanks, here is 0.1mDASH</pre>Or write a new tweet to the person you
						want to tip and also mention @MyDashWallet in there like ('a beer' will tip the
						equivalent Dash amount of 1 USD, 'cookie' is 0.50 USD, etc.):
						<pre>@TheDesertLynx Superb article, have a beer on me @MyDashWallet</pre>
					</li>
					<li data-i18n="[html]TippingReddit">
						<b>
							<a href="https://www.reddit.com/r/dashpay/">Reddit</a>
						</b>
						: <a href="https://reddit.com/u/MyDashWallet">/u/MyDashWallet</a> is listening to all
						sub reddits and will allow you to tip or check your balance, deposit, withdrawal, etc. (
						<a href="https://reddit.com/u/MyDashWallet">all commands explained here</a>), for
						example reply to a post you like with:{' '}
						<pre>/u/MyDashWallet Great website, here is 1 mDASH</pre>
					</li>
					<li data-i18n="[html]TippingDiscord">
						<b>
							<a href="https://discordapp.com/invite/9z8zX5j">Discord</a>
						</b>
						: Check if the MyDashWallet bot is running on your server (e.g.{' '}
						<a href="https://discordapp.com/invite/9z8zX5j">Dash on Discord</a>), if not ask the
						admins to add the bot:{' '}
						<a href="https://discordapp.com/api/oauth2/authorize?client_id=468397516182913024&permissions=18432&scope=bot">
							@MyDashWallet#6549 (click to authorize if you are a server admin)
						</a>
						. You can issues commands to the bot like: !price, !help, !balance, !deposit,
						!withdrawal, !account or !tip, for example:{' '}
						<pre>!tip @TheDesertLynx 1.50 USD great article</pre>
					</li>
					<li data-i18n="[html]TippingOther">
						<b>Telegram</b>: On telegram you can add the bot via <b>@MyDashWalletBot</b> or talk to{' '}
						<a href="http://t.me/MyDashWalletBot">http://t.me/MyDashWalletBot</a>
						<br />
						Commands start with a / on Telegram, so you can type /price, /tip, /withdrawal, /deposit
						and most other commands. Keep in mind due to Telegrams restrictions the bot has no
						rights to contact users, thus all commands are visible in the chat and users also must
						have a username set to communicate with the bot.
						<br />
						<br />
						<b>Other</b>: We don't have bots running on other social platforms yet, but you can
						still easily tip anyone via email (select the email option when sending from your
						unlocked wallet). You can also tip yourself via email and then give the link to anyone
						(same goes for private messages you receive on reddit, discord or twitter), but be aware
						ANYONE that has this link can access all the funds on that address, don't post it
						publicly.
					</li>
				</ul>
				<br />
				<h3 data-i18n="TippingCanITipHeader">
					Can I tip without having any Dash in MyDashWallet yet?
				</h3>
				<span data-i18n="[html]TippingCanITipContent">
					MyDashWallet supports a <b>tipping pot</b> (check via the /balance command). Anything you
					receive via tips or any Dash you send to your address given via the /deposit command will
					end up in your tipping pot for future use. If you have redirected your receive address
					(via /account) to an address only you control MyDashWallet will still send all received
					tips to that address, but it cannot send any Dash and will create a new address next time
					you call /tip, /account or /deposit.
				</span>
				<br />
				<br />
				<h3 data-i18n="TippingRecipientHeader">
					What happens if the recipient doesn't use MyDashWallet yet?
				</h3>
				<span data-i18n="[html]TippingRecipientContent">
					It doesn't matter, MyDashWallet simply sends Dash from your address to any other address,
					like any other Dash wallet also does. However if you tip someone in one of the social
					platforms or via email, the receipent automatically gets a new account he can log into
					with one click to claim his Dash, send it anywhere else, keep it or tip it to someone
					else.
				</span>
				<br />
				<br />
				<h3 data-i18n="TippingMistakeHeader">I made a mistake, can I get my tip back?</h3>
				<span data-i18n="[html]TippingMistakeContent">
					If you made a mistake while tipping (invalid dash address, invalid email, unknown user,
					etc.) MyDashWallet will immediately inform you and cancel the tip right away. However if
					you send someone Dash and the transaction is on the blockchain, it is irreversable and
					cannot be claimed back. We are aware that tipping someone via Reddit, Twitter, etc. or via
					Email doesn't mean the receiver will actually claim his newly received Dash. For this
					reason there is a time-out if the receiver DOES NOT have a MyDashWallet yet: After 7 days
					newly created tip accounts will be destroyed again and all funds will be send back to the
					original sender. No time-outs for existing users, once you receive Dash and see it in your
					balance, it is yours, we will never take it back. To feel safe we recommend moving any
					received Dash to an address only you control (either on a hardware wallet or via your own
					keystore, then only you control the funds via your private keys). You can also tell the
					MyDashWallet bot to use a specific Dash address for receiving (via the /account command),
					in this case the funds are always under your control, we can't refund or help with any
					issues in this case.
				</span>
				<br />
				<br />
				<h3>Supported Commands</h3>
				<table
					style={{
						border: '1px solid lightgray',
						borderSpacing: '10px',
						borderCollapse: 'separate',
					}}
				>
					<tbody>
						<tr>
							<td>Command</td>
							<td>Discord</td>
							<td>Reddit</td>
							<td>Twitter</td>
							<td>Telegram</td>
							<td>Email</td>
						</tr>
						<tr>
							<td>Tip</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
						</tr>
						<tr>
							<td>Auto-Parse any mention text as Tip</td>
							<td />
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
						</tr>
						<tr>
							<td>Help</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Price</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Balance</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Deposit</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Withdrawal</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Account</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Rate</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Chat</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>AddCurrency</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>UserCurrencies</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Donate</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>Swap</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>Rain</td>
							<td>X</td>
							<td />
							<td />
							<td>X</td>
							<td />
						</tr>
						<tr>
							<td>Coinflip</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>Lottery</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>BuyTicket</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>CreateLottery</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>EndLottery</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>CreateTxSpike</td>
							<td>X</td>
							<td />
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td>
								<a href="https://old.mydashwallet.org/Api">Api Support</a>
							</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
							<td>X</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}
}
