import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export class Chat extends Component {
	componentDidMount() {
		/*better do this via api
		setTimeout(function() {
			if (window.location.href.includes('Timezone')) document.location.reload(true)
			else window.location.href = '/chat?Timezone=' + new Date().getTimezoneOffset()
		}, 10000)
		*/
	}
	render() {
		return (
			<div>
				<h1>Chat on the Dash Blockchain</h1>
				<br />
				<h3>
					Use the{' '}
					<Link to="/tip" onClick={() => this.props.setMode('tip')}>
						!chat command
					</Link>{' '}
					or{' '}
					<Link to="/" onClick={() => this.props.setMode('')}>
						unlock your wallet
					</Link>{' '}
					to add messages to the blockchain
				</h3>
				<iframe
					src="https://old.mydashwallet.org/chat"
					title="chat from old site"
					width="100%"
					height="600px"
				/>
				<br />
				<br />
				Dash's blockchain is a decentralized database which main purpose is to secure and hold all
				Dash transactions. It can be used to store other data too. https://MyDashWallet.org/Chat
				allows anyone to easily decode and read arbitrary messages saved on the block chain. If you
				login with your MyDashWallet you can also write chat text to the blockchain at fraction of a
				cent. No single entity has the power to alter or truncate these messages. This service
				operates automatically and is not moderated because the block chain cannot be moderated. The
				authors of this site are not responsible for the content it displays. Viewer discretion is
				advised.{' '}
				<a href="https://dash-docs.github.io/en/developer-guide#term-null-data">
					Anyone can write messages to the blockchain
				</a>{' '}
				and read them in <a href="https://chainz.cryptoid.info/dash/">most</a>{' '}
				<a href="https://live.blockcypher.com/dash">block</a>{' '}
				<a href="https://explorer.mydashwallet.org">explorers</a> (click on Raw/Advanced or{' '}
				<a href="http://dolcevie.com/js/converter.html">convert the hex to text yourself</a>).
			</div>
		)
	}
}
