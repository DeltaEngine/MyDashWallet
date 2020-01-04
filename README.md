New snappy rewritten wallet out 2019-07-31, check it out: https://MyDashWallet.org

# MyDashWallet

https://MyDashWallet.org provides an easy way for anyone to create DASH wallets locally in the browser or use existing hardware wallets and send DASH to anyone. For details about DASH see www.dash.org

This project is open-source, free to use and development was funded by the DASH DAO (Decentralized Autonomous Organization): https://www.dashcentral.org/p/MyDashWallet

# Runs locally

You can simply download the website https://MyDashWallet.org and run it locally, the whole wallet functionality (including hardware wallets, creating hd wallets, unlocking, etc.) all runs offline and in your browser. However when you want to see the current dash amount or send out dash you need to be online as the website communicates with https://insight.dash.org for the dash amount in your addresses and to send it will utilize an open empty dash node for broadcasting locally signed transactions into the Dash network.

# Installation

Simply run [npm install](https://www.npmjs.com/get-npm) or [yarn install](https://yarnpkg.com/lang/en/docs/install) to grab all dependencies and then start the site via **_npm start_** or **_yarn start_**. This should be the same for Windows, MacOS and Linux. For the [React](https://reactjs.org/) development of this site Visual Studio Code was used, but it is not a requirement.

# Technology

The https://old.mydashwallet.org version was a clone of MyEtherWallet with more on and more features added on top over 1.5 years (using a mix of technologies, asp.net, .net core, plain javascript, angular parts, etc.). Both the javascript and css files were not pretty at the end and hard to impossible to maintain. Sadly there was also an [old external script](https://mydashwallet.org/scripthack) still included, but unused, which a hacker used to get private keys from new wallets in <a href="https://twitter.com/Dashpay/status/1149552764923465735">May and June of 2019</a>. The old site has been fixed and contains still many features (e.g. mixing in the browser, api and other experiments done over the years), anyone is free to use it.

The new website https://mydashwallet.org was completely rewritten in 100% [React](https://reactjs.org/) and is much more responsive, easier to use and most importantly safer. There are no external references or libraries besides React.js, ledger or trezor hardware wallet libraries. There is no backend, everything runs locally. It also features a preview of the [decentralized mixing feature, a world first to directly mix in the browser](https://mydashwallet.org/mix), it even works on mobile.

# Safety

Like before anyone is free to use the wallet locally, copy or modify it. Obviously users should only use big funds if they have a hardware wallet, the new website will warn the user if he has any serious amount (>\$100) in his wallet and is not using a hardware wallet! MyDashWallet does not hold any user funds, can't restore any funds or keys. Every user is responsible to keep his account and keys safe, do not trust anyone, always double check before sending, more details at https://mydashwallet.org/help

In any case, the risk of anything malicous to happen is very low if you use a hardware wallet and ALWAYS check the address and amount you send out, your Dash can't be stolen or redirected. Dash transactions are however irreversable and noone can help you if you send something to the wrong address.
