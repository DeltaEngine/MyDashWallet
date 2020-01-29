import React, { Component } from 'react'

export class Help extends Component {
	render() {
		return (
			<div>
				<h1>Terms and conditions</h1>
				<div className="box-info">
					<span data-i18n="AboutOverview">
						Please take some time to understand this for your own safety.
					</span>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutWhatIsMyDashWallet">What is MyDashWallet.org?</h3>
							<ul>
								<li data-i18n="AboutWhatIsMyDashWallet1">
									MyDashWallet is a free,{' '}
									<a href="https://github.com/DeltaEngine/MyDashWallet">open-source</a>, client-side
									interface.
								</li>
								<li data-i18n="AboutWhatIsMyDashWallet2">
									We allow you to interact directly with the blockchain while remaining in full
									control of your keys &amp; your funds.
								</li>
								<li data-i18n="[html]AboutWhatIsMyDashWallet3">
									Includes support for great features of Dash:{' '}
									<a href="/AboutInstantSend">InstantSend</a> and{' '}
									<a href="/AboutPrivateSend">PrivateSend</a>
								</li>
								<li data-i18n="AboutWhatIsMyDashWallet4">
									You and only you are responsible for your security.
								</li>
								<li data-i18n="AboutWhatIsMyDashWallet5">
									We cannot recover your funds or freeze your account if you visit a phishing site
									or lose your private key. Using a hardware wallet is MUCH safer as no one will
									ever have access to your private keys.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img
								src="https://media.dash.org/wp-content/uploads/dash_digital-cash_logo_2018_rgb_for_screens_s.png"
								style={{
									width: '400px',
								}}
								alt="Dash"
							/>
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutImportantQuestions">Important questions</h3>
							<ul>
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
										How to create a new wallet via Keystore file
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
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/icon-help-2.svg" style={{ width: '400px' }} alt="help" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutNotABank">MyDashWallet is not a Bank</h3>
							<ul>
								<li data-i18n="AboutNotABank1">
									When you open an account with a bank or exchange, they create an account for you
									in their system.
								</li>
								<li data-i18n="AboutNotABank2">
									The bank keeps track of your personal information, account passwords, balances,
									transactions and ultimately your money.
								</li>
								<li data-i18n="AboutNotABank3">
									The bank charge fees to manage your account and provide services, like refunding
									transactions when your card gets stolen.
								</li>
								<li data-i18n="AboutNotABank4">
									The bank allows you to write a check or charge your debit card to send money, go
									online to check your balance, reset your password, and get a new debit card if you
									lose it.
								</li>
								<li data-i18n="AboutNotABank5">
									You have an account with the bank or exchange and they decide how much money you
									can send, where you can send it, and how long to hold on a suspicious deposit. All
									for a fee.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-02.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutInterface">MyDashWallet is an Interface</h3>
							<ul>
								<li data-i18n="AboutInterface1">
									When you create an account on MyDashWallet you are generating a cryptographic set
									of numbers: your private key and your public key (address).
								</li>
								<li data-i18n="AboutInterface2">
									The handling of your keys happens entirely on your computer, inside your browser.
								</li>
								<li data-i18n="AboutInterface3">
									We never transmit, receive or store your private key, password, or other account
									information. You are simply using our interface to interact directly with the
									blockchain.
								</li>
								<li data-i18n="AboutInterface4">We do not charge a transaction fee. </li>
								<li data-i18n="AboutInterface5">
									If the site is modified, hacked, redirected, script injected and a hacker gets
									your private keys, he will get access to your funds and there is nothing anyone
									can do to help. You are your own bank! Only use small amounts or switch to using a
									hardware wallet.
								</li>
								<li data-i18n="AboutInterface6">
									If you send your public key (address) to someone, they can send you DASH.
									<span role="img" aria-label="thumbs-up">
										👍
									</span>
								</li>
								<li data-i18n="AboutInterface7">
									If you send your private key to someone, they now have full control of your
									account.
									<span role="img" aria-label="thumbs-down">
										👎
									</span>
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-03.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutBlockchain">Wait, WTF is a Blockchain?</h3>
							<ul>
								<li data-i18n="AboutBlockchain1">
									The blockchain is like a huge, global, decentralized spreadsheet.
								</li>
								<li data-i18n="AboutBlockchain2">
									It keeps track of who sent how many coins to whom, and what the balance of every
									account is.
								</li>
								<li data-i18n="AboutBlockchain3">
									It is stored and maintained by thousands of people (miners) across the globe who
									have special computers.
								</li>
								<li data-i18n="AboutBlockchain4">
									The blocks in the blockchain are made up of all the individual transactions sent
									from MyDashWallet and everywhere else.
								</li>
								<li data-i18n="[html]AboutBlockchain5">
									When you see your balance on MyDashWallet.org or view your transactions on{' '}
									<a href="https://explorer.mydashwallet.org">https://explorer.mydashwallet.org</a>{' '}
									or one of the other supported explorers, you are seeing data on the blockchain,
									not in our personal systems.
								</li>
								<li data-i18n="AboutBlockchain6">Again: we are not a bank </li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-04.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="[html]AboutUnderstand">
								We need you to understand that we <strong>cannot</strong>...
							</h3>
							<ul>
								<li data-i18n="AboutUnderstand1">
									Access your account or send your funds for you X.
								</li>
								<li data-i18n="AboutUnderstand2">Recover or change your private key.</li>
								<li data-i18n="AboutUnderstand3">Recover or reset your password.</li>
								<li data-i18n="AboutUnderstand4">Reverse, cancel, or refund transactions.</li>
								<li data-i18n="AboutUnderstand5">Freeze accounts.</li>
							</ul>
							<h3 data-i18n="[html]AboutUnderstand6">
								<strong>You</strong> and <strong>only you</strong> are responsible for your
								security.
							</h3>
							<ul>
								<li data-i18n="AboutUnderstand7">
									Be diligent to keep your private key and password safe. Your private key is
									sometimes called your mnemonic phrase, keystore file, UTC file, JSON file, wallet
									file.
								</li>
								<li data-i18n="AboutUnderstand7">
									If lose your private key or password, no one can recover it.
								</li>
								<li data-i18n="AboutUnderstand7">
									If you enter your private key on a phishing website, you will have all your funds
									taken.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-05.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutPoint">
								If MyDashWallet can't do those things, what's the point?
							</h3>
							<ul>
								<li data-i18n="AboutPoint1">
									Because that is the point of decentralization and the blockchain.
								</li>
								<li data-i18n="AboutPoint2">
									You don't have to rely on your bank, government, or anyone else when you want to
									move your funds.
								</li>
								<li data-i18n="AboutPoint3">
									You don't have to rely on the security of an exchange or bank to keep your funds
									safe.
								</li>
								<li data-i18n="AboutPoint4">
									If you don't find these things valuable, ask yourself why you think the blockchain
									and cryptocurrencies are valuable.{' '}
									<span role="img" aria-label="winking-face">
										😉
									</span>
								</li>
								<li data-i18n="[html]AboutPoint5">
									If you don't like the sound of this, consider using{' '}
									<a href="https://uphold.com/">Uphold</a>,{' '}
									<a href="https://www.coinbase.com/">Coinbase</a> or any online exchange or service
									supporting Dash. They have more familiar accounts with usernames &amp; passwords.
								</li>
								<li data-i18n="[html]AboutPoint6">
									If you are scared but want to use MyDashWallet,{' '}
									<a href="/AboutHardwareWallets">get a hardware wallet</a>! These keep your keys
									secure.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-06.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutPhishers">How To Protect Yourself from Phishers</h3>
							<span data-i18n="AboutPhishers1">
								Phishers send you a message with a link to a website that looks just like
								MyDashWallet, Paypal, or your bank, but is not the real website. They steal your
								information and then steal your money.
							</span>
							<ul>
								<li data-i18n="[html]AboutPhishers2">
									Always check the URL: <code>https://MyDashWallet.org</code>.
								</li>
								<li data-i18n="[html]AboutPhishers3">
									Always make sure the <code>MyDashWallet.org</code> URL bar has <b>Secure</b> in
									green.
								</li>
								<li data-i18n="AboutPhishers4">
									Do not trust messages or links sent to you randomly via email, Slack, Reddit,
									Twitter, etc.
								</li>
								<li data-i18n="AboutPhishers5">
									Always navigate directly to a site before you enter information. Do not enter
									information after clicking a link from a message or email.
								</li>
								<li data-i18n="[html]AboutPhishers6">
									<a href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm?hl=en">
										Install an AdBlocker
									</a>{' '}
									and do not click ads on your search engine (e.g. Google).
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-07.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutScams">How To Protect Yourself from Scams</h3>
							<span data-i18n="AboutScams1">
								People will try to get you to give them money in return for nothing.
							</span>
							<ul>
								<li data-i18n="AboutScams2">If it is too good to be true, it probably is. </li>
								<li data-i18n="AboutScams3">
									Research before sending money to someone or some project. Look for information on
									a variety of websites and forums. Be wary.
								</li>
								<li data-i18n="AboutScams4">
									Ask questions when you don't understand something or it doesn't seem right.
								</li>
								<li data-i18n="[html]AboutScams5">
									Don't let fear,{' '}
									<a href="https://en.wikipedia.org/wiki/Fear,_uncertainty_and_doubt">FUD</a>, or{' '}
									<a href="https://en.wikipedia.org/wiki/Fear_of_missing_out">FOMO</a> win over
									common sense. If something is very urgent, ask yourself "why?". It may be to
									create FOMO or prevent you from doing research.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-08.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutLoss">How To Protect Yourself from Loss</h3>
							<span data-i18n="AboutLoss1">
								If you lose your private key or password, it is gone forever. Don't lose it.
							</span>
							<ul>
								<li data-i18n="AboutLoss2">
									Make a backup of your private key and password. Do NOT just store it on your
									computer. Print it out on a piece of paper or save it to a USB drive.
								</li>
								<li data-i18n="AboutLoss3">
									Store this paper or USB drive in a different physical location. A backup is not
									useful if it is destroyed by a fire or flood along with your laptop.
								</li>
								<li data-i18n="AboutLoss4">
									Do not store your private key in Dropbox, Google Drive, or other cloud storage. If
									that account is compromised, your funds will be stolen.
								</li>
								<li data-i18n="AboutLoss5">
									If you have more than $100 worth of cryptocurrency, get a hardware wallet. No
									excuses. It's worth it.
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-09.svg" alt="" />
						</div>
					</section>
					<br />
					<br />
					<section className="row align-items-center">
						<div className="col col-sm-7">
							<h3 data-i18n="AboutOnwards">More help from old.mydashwallet.org</h3>
							<ul>
								<li>
									<a
										href="https://old.mydashwallet.org/AboutHardwareWallets"
										data-i18n="AboutHardwareWalletsHeader"
									>
										Hardware Wallets
									</a>
								</li>
								<li>
									<a
										href="https://old.mydashwallet.org/AboutCreateNewWallet"
										data-i18n="AboutCreateNewWalletHeader"
									>
										Create new wallet
									</a>
								</li>
								<li>
									<a
										href="https://old.mydashwallet.org/AboutInstantSend"
										data-i18n="AboutInstantSendHeader"
									>
										How does InstantSend work?
									</a>
								</li>
								<li>
									<a
										href="https://old.mydashwallet.org/AboutPrivateSend"
										data-i18n="AboutPrivateSendHeader"
									>
										How does PrivateSend work?
									</a>
								</li>
								<li>
									<a
										href="https://old.mydashwallet.org/AboutInstantSend"
										data-i18n="AboutTransactionFeesHeader"
									>
										About Transaction Fees
									</a>
								</li>
								<li>
									<a href="https://old.mydashwallet.org/AboutVideos" data-i18n="AboutGreatVideos">
										Great videos about Dash and how blockchains work
									</a>
								</li>
								<li>
									<span data-i18n="About">About</span>{' '}
									<a href="https://old.mydashwallet.org/AboutMyDashWallet">MyDashWallet</a>
								</li>
								<li>
									<a href="https://youtu.be/phht73IvUDI?t=58" data-i18n="AboutPreferAVideo">
										Prefer a video walkthrough? Here's one for MyEtherWallet, MyDashWallet is
										similar
									</a>
								</li>
							</ul>
						</div>
						<div className="col col-sm-4 offset-sm-1">
							<img src="/images/onboarding_icon-10.svg" alt="" />
						</div>
					</section>
				</div>
			</div>
		)
	}
}
