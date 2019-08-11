import React, { Component } from 'react'
import styled from 'styled-components'

const Panel = styled.div`
	float: right;
	width: 48%;
	position: relative;
	background: #fff;
	padding: 15px;
	border-radius: 15px;
	box-shadow: 3px 3px 3px #dadbdb;
	@media screen and (max-width: 768px) {
		float: none;
		width: 100%;
		font-size: 12px;
	}
`

export class ReceiveDash extends Component {
	render = () => {
		return (
			<Panel>
				<h3>Your receive address</h3>
				<b>{this.props.lastUnusedAddress}</b>
				<br />
				<img
					src={
						'//chart.googleapis.com/chart?cht=qr&chl=' +
						this.props.lastUnusedAddress +
						'&choe=UTF-8&chs=200x200&chld=L|0'
					}
					alt="QR Code"
				/>
				{this.props.reversedAddresses.length > 1 && (
					<div>
						<h5>Your older addresses</h5>
						{this.props.reversedAddresses.slice(1).map(a => (
							<div key={a} style={{ fontSize: '12px' }}>
								<a
									href={'https://explorer.mydashwallet.org/address/' + a}
									target="_blank"
									rel="noopener noreferrer"
								>
									{a}
								</a>
								<div
									style={{
										float: 'right',
										color:
											this.props.addressBalances && this.props.addressBalances[a] === 0.0100001
												? 'rgb(141, 0, 228)'
												: 'black',
									}}
								>
									{this.props.showDashNumber(
										this.props.addressBalances && this.props.addressBalances[a]
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</Panel>
		)
	}
}
