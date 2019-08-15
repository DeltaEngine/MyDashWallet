import React, { Component } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faMoneyBill,
	faDollarSign,
	faEuroSign,
	faPoundSign,
	faLock,
} from '@fortawesome/free-solid-svg-icons'

const BalancesPanel = styled.div`
	display: flex;
	margin-top: 20px;
	margin-bottom: 20px;
`
const BalanceBox = styled.div`
	width: 32%;
	margin-right: 2%;
	position: relative;
	background: #fff;
	padding: 15px;
	border-radius: 15px;
	box-shadow: 3px 3px 3px #dadbdb;
`
const BalanceBoxTitle = styled.div`
	font-size: 18px;
	line-height: 30px;
	color: #012060;
	display: block;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	@media screen and (max-width: 767px) {
		font-size: 14px;
		line-height: 20px;
	}
`
const BalanceBoxValue = styled.div`
	padding-top: 20px;
	font-size: 37px;
	line-height: 30px;
	color: #008de4;
	display: block;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: clip;
	position: relative;
	@media screen and (max-width: 767px) {
		padding-top: 6px;
		line-height: 20px;
		font-size: 22px;
	}
`
const Icon = styled(FontAwesomeIcon)`
	font-size: 40px;
	color: lightgray;
	position: absolute;
	bottom: 10px;
	right: 20px;
	@media screen and (max-width: 767px) {
		font-size: 24px;
		bottom: 15px;
		right: 10px;
	}
`

export class Balances extends Component {
	render = () => {
		return (
			<BalancesPanel>
				<BalanceBox title="Your DASH Balance">
					<BalanceBoxTitle>DASH Balance</BalanceBoxTitle>
					<Icon icon={faMoneyBill} />
					<BalanceBoxValue>{this.props.showNumber(this.props.totalBalance, 8)}</BalanceBoxValue>
				</BalanceBox>
				<BalanceBox title="PrivateSend Balance">
					{window.innerWidth > 768 && (
						<button style={{ float: 'right' }} onClick={() => this.props.setMode('mix')}>
							Mix
						</button>
					)}
					<BalanceBoxTitle>PrivateSend Balance</BalanceBoxTitle>
					<Icon icon={faLock} />
					<BalanceBoxValue style={{ color: '#8d00e4' }}>
						{this.props.showNumber(this.props.privateSendBalance, 8)}
					</BalanceBoxValue>
				</BalanceBox>
				<BalanceBox
					style={{ marginRight: '0' }}
					title={
						'1 DASH = ' +
						this.props.getSelectedCurrencyDashPrice() +
						' ' +
						this.props.selectedCurrency
					}
				>
					<BalanceBoxTitle>
						<select
							value={this.props.selectedCurrency}
							onChange={e => this.props.setSelectedCurrency(e.target.value)}
						>
							<option value="USD">USD</option>
							<option value="EUR">EUR</option>
							<option value="GBP">GBP</option>
						</select>{' '}
						Balance
					</BalanceBoxTitle>
					<Icon
						icon={
							this.props.selectedCurrency === 'EUR'
								? faEuroSign
								: this.props.selectedCurrency === 'GBP'
								? faPoundSign
								: faDollarSign
						}
					/>
					<BalanceBoxValue style={{ color: '#8de400' }}>
						{this.props.showNumber(
							this.props.totalBalance * this.props.getSelectedCurrencyDashPrice(),
							2
						)}
					</BalanceBoxValue>
				</BalanceBox>
			</BalancesPanel>
		)
	}
}
