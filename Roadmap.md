Roadmap for MyDashWallet
========================

* Completed: January 2018 Update: Basic Web Wallet and Website up and working

* Completed: February 2018 Update: Hardware Wallet support for Ledger and TREZOR

* Completed: March 2018 Update: We have tested all services now for about a week and improved it. The basic https://MyDashWallet.org is now complete and we will add the remaining tipping services till next week:
- Website tested in many browsers, desktop, mobile, many different screen resolutions and formats
- Full support of in-browser keystore file creation with password protection
- Support of Ledger Nano Hardware Wallets with display of each address balance
- TREZOR Support, the libraries are a bit more managed on the TREZOR api (you need to enter pin and approve reading the account on each login, and then confirm each transaction twice, it's the TREZOR way), but all features are also supported
- Import, export of private keys (only for keystore files, hardware wallets won't give you private keys obviously)
- QR codes for receiving (and when exporting paper wallets also showing an QR code for easy swiping of the whole account)
- Full support of advanced Dash features: InstantSend and PrivateSend (private send mixing is done on the MyDashWallet node and NOT trustless, only use if you are ok with it, but this is the only non-full node solution out there)
- Full source code of the website, all javascript and most of the services are available (some files with our configurations are missing on purpose, but all the information is included on how to run it on your own full Dash node rpc connection if this is what you want to do) on https://github.com/DeltaEngine/MyDashWallet

* Completed: April 2018 Update:
- Direct tipping (from the website into an email, twitter, reddit, etc. user account)

* Completed: May 2018 Update: Created MyDashWallet2 proposal, which was funded as well
- The Mixing site is used a lot and we have seen a ton of mixing requests in the past days, this will be a focus for MyDashWallet#2, here we plan provide multiple nodes to increase mixing speed and to allow users to customize the number of mixing rounds (2-8, more will have higher fees) and also the ability for users to abort mixing in whatever round it currently is in and send out the pending Dash to the target address as some mixing events have taken days because of the huge demand we have seen recently.
- And of course ongoing work, integrating the new Dash logos and identity plus support for any user issues (which runs quite smooth right now).

* In-Progress: June 2018: Website update, Languages, Bots with tons of new features, unconfirmed amounts support
- Better TREZOR Hardware Wallet Support, also for the new TREZOR Model T. Things work, but Ledger support is much better right now on MyDashWallet due to native javascript implementation, for Trezor a high level api is used and a popup is shown, there are some limitations for InstantSend and low fees, we can do better with a custom low level javascript library.
- MyDashWallet has its own block explorer now and we can finally support unconfirmed amounts, also we don't have to wait for tx or addresses to appear anymore as our block explorer can directly show the latest state: https://mydashwallet.org:3001/insight/
- Easier tipping without having to wait for confirmations, Trustless Tipping to directly send from hardware wallet to the recipient, merging social accounts with existing hardware or MyDashWallet keystore wallets
- Bot Improvements for Twitter, Reddit and most importantly Discord (the bot also runs of Telegram and email, but we mostly focus on the 3 active platforms): Improvements to tipping, rain and other existing commands, adding mini games and community focused features like: Dice Betting Games, Lottery, Voting, CoinFlip, Russian Roulette, Contests

* In-Progress: July 2018: 
- Translations to all major languages (English, Spanish, French, German, Portuguese, Italian, maybe Chinese, Korean, Russian and others if we find good cheap translators)
- A simple installer to get MyDashWallet hosted on your own server and/or connecting to your own Dash Full Node, this has been requested many times and some users are already running their own version of the website and changed the connection the node, but for non-technical persons it is too difficult, this simple installer will make it possible for anyone.
- Native Android and iOS wallets utilizing MyDashWallet.org (either as a native app hosting the website or some other way, not sure yet)

* In-Progress: August 2018 (might have to cut some features if funding runs out):
- Swapping Dash for other coins like BTC, BCH, ETH or LTC, we have a partner providing us with low fees (much lower than Shapeshift or Changelly) and can provide a much better and easier way to exchange any supported coin to and from Dash
- InstantSend Block Explorer support, so you see right away that InstantSend tx have 6 confirmations

More details: https://www.dash.org/forum/threads/mydashwallet-with-tipping-and-hardware-wallet-support.20566/
