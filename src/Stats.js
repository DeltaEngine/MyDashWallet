import React, { Component } from 'react'

export class Stats extends Component {
	componentWillMount() {
		document.body.style.backgroundImage = "url('/images/BackgroundWalletIllustration.png')"
	}
	componentWillUnmount() {
		document.body.style.backgroundImage = null
	}
	render() {
		return (
			<div>
				<h1>Statistics</h1>
				<h3>Totals</h3>
				<ul>
					<li>
						Transactions: <b>80638</b>
					</li>
					<li>
						Dash Send: <b>309190 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>10044</b>
					</li>
					<li>
						Dash Mixed: <b>131924.6 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>5144</b>
					</li>
					<li>
						Tip Accounts: <b>3695</b>
					</li>
					<li>
						Tips: <b>55877</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>15049</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>August 2019</h3>
				<ul>
					<li>
						Transactions: <b>2551</b>
					</li>
					<li>
						Dash Send: <b>7318 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>163</b>
					</li>
					<li>
						Dash Mixed: <b>3120.7 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>75</b>
					</li>
					<li>
						Tip Accounts: <b>199</b>
					</li>
					<li>
						Tips: <b>1666</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>17</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>July 2019</h3>
				<ul>
					<li>
						Transactions: <b>5977</b>
					</li>
					<li>
						Dash Send: <b>19848.9 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>601</b>
					</li>
					<li>
						Dash Mixed: <b>8636.6 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>289</b>
					</li>
					<li>
						Tip Accounts: <b>40</b>
					</li>
					<li>
						Tips: <b>862</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>34</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>June 2019</h3>
				<ul>
					<li>
						Transactions: <b>4837</b>
					</li>
					<li>
						Dash Send: <b>44422.8 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>746</b>
					</li>
					<li>
						Dash Mixed: <b>16556 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>326</b>
					</li>
					<li>
						Tip Accounts: <b>156</b>
					</li>
					<li>
						Tips: <b>1202</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>109</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>May 2019</h3>
				<ul>
					<li>
						Transactions: <b>3863</b>
					</li>
					<li>
						Dash Send: <b>41206.3 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>849</b>
					</li>
					<li>
						Dash Mixed: <b>18623.6 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>196</b>
					</li>
					<li>
						Tip Accounts: <b>81</b>
					</li>
					<li>
						Tips: <b>975</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>111</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>April 2019</h3>
				<ul>
					<li>
						Transactions: <b>2993</b>
					</li>
					<li>
						Dash Send: <b>24018.3 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>994</b>
					</li>
					<li>
						Dash Mixed: <b>11960.8 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>131</b>
					</li>
					<li>
						Tip Accounts: <b>86</b>
					</li>
					<li>
						Tips: <b>799</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>75</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>March 2019</h3>
				<ul>
					<li>
						Transactions: <b>4002</b>
					</li>
					<li>
						Dash Send: <b>15132.9 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>528</b>
					</li>
					<li>
						Dash Mixed: <b>6655.5 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>303</b>
					</li>
					<li>
						Tip Accounts: <b>275</b>
					</li>
					<li>
						Tips: <b>2196</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>144</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>February 2019</h3>
				<ul>
					<li>
						Transactions: <b>3183</b>
					</li>
					<li>
						Dash Send: <b>15798.8 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>499</b>
					</li>
					<li>
						Dash Mixed: <b>7886.2 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>75</b>
					</li>
					<li>
						Tip Accounts: <b>295</b>
					</li>
					<li>
						Tips: <b>2134</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>72</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>January 2019</h3>
				<ul>
					<li>
						Transactions: <b>7673</b>
					</li>
					<li>
						Dash Send: <b>22258.9 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>761</b>
					</li>
					<li>
						Dash Mixed: <b>11129.7 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>132</b>
					</li>
					<li>
						Tip Accounts: <b>243</b>
					</li>
					<li>
						Tips: <b>5138</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>941</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>December 2018</h3>
				<ul>
					<li>
						Transactions: <b>13949</b>
					</li>
					<li>
						Dash Send: <b>29166.6 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>809</b>
					</li>
					<li>
						Dash Mixed: <b>21855.6 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>54</b>
					</li>
					<li>
						Tip Accounts: <b>235</b>
					</li>
					<li>
						Tips: <b>11353</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>1594</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>November 2018</h3>
				<ul>
					<li>
						Transactions: <b>11631</b>
					</li>
					<li>
						Dash Send: <b>26387.9 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>697</b>
					</li>
					<li>
						Dash Mixed: <b>5761.6 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>0</b>
					</li>
					<li>
						Tip Accounts: <b>251</b>
					</li>
					<li>
						Tips: <b>10292</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>642</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>October 2018</h3>
				<ul>
					<li>
						Transactions: <b>9985</b>
					</li>
					<li>
						Dash Send: <b>24160 DASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>687</b>
					</li>
					<li>
						Dash Mixed: <b>5275.1 DASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>0</b>
					</li>
					<li>
						Tip Accounts: <b>251</b>
					</li>
					<li>
						Tips: <b>6231</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>3067</b>
					</li>
				</ul>
				<br />
				<br />
				<br />
				<br />
				<h2>Old Stats (accumulated)</h2>
				<h3>24. October 2018 Update</h3>
				<ul>
					<li>
						Transactions: <b>14282</b>
					</li>
					<li>
						Dash Send: <b>47 164 733 mDASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>3705</b>
					</li>
					<li>
						Dash Mixed: <b>17 913 699 mDASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>3605</b>
					</li>
					<li>
						Tip Accounts: <b>1981</b>
					</li>
					<li>
						Tips: <b>21691</b> (+100% in a month)
					</li>
					<li>
						CoinFlips (Bot Game): <b>12254</b> (another 3x increase)
					</li>
					<li>Desktop: 77.3%</li>
					<li>Mobile: 21.0%</li>
					<li>Tablet: 1.7%</li>
				</ul>
				<br />
				<br />
				<h3>7. September 2018 Update</h3>
				<ul>
					<li>
						Transactions: <b>12977</b>
					</li>
					<li>
						Dash Send: <b>34 839 763 mDASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>2502</b>
					</li>
					<li>
						Dash Mixed: <b>12 953 710 mDASH</b> (+120% in just August)
					</li>
					<li>
						InstantSend Transactions: <b>1420</b>
					</li>
					<li>
						Tip Accounts: <b>1583</b>
					</li>
					<li>
						Tips: <b>10646</b> (+30% in the past few weeks)
					</li>
					<li>
						CoinFlips (Bot Game): <b>3497</b> (almost 100x in the past 5-6 weeks)
					</li>
					<li>In August broke our unique user record by another 18% to 2161</li>
					<li>Desktop: 78.0%</li>
					<li>Mobile: 20.4%</li>
					<li>Tablet: 1.6%</li>
				</ul>
				<br />
				<br />
				<h3>21. August 2018 Update</h3>
				<ul>
					<li>
						Transactions: <b>11475</b>
					</li>
					<li>
						Dash Send: <b>24 423 042 mDASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>2233</b>
					</li>
					<li>
						Dash Mixed: <b>8 552 191 mDASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>1280</b>
					</li>
					<li>
						Tip Accounts: <b>1459</b>
					</li>
					<li>
						Tips: <b>6827</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>1284</b>
					</li>
					<li>
						In July the website had 1832 unique users, which is 82.47% higher our previous record.
						However since Early August numbers have dropped off during the continuing price decline.
					</li>
					<li>Desktop: 82.4%</li>
					<li>Mobile: 16.4%</li>
					<li>Tablet: 1.2%</li>
				</ul>
				<br />
				<br />
				<h3>24. July 2018 Update</h3>
				<ul>
					<li>
						Transactions: <b>7183</b>
					</li>
					<li>
						Dash Send: <b>16 278 945 mDASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>1693</b>
					</li>
					<li>
						Dash Mixed: <b>5 161 823 mDASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>1100</b>
					</li>
					<li>
						Tip Accounts: <b>1198</b>
					</li>
					<li>
						Tips: <b>2031</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>38</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>23. June 2018 Update</h3>
				<ul>
					<li>
						Transactions: <b>4955</b>
					</li>
					<li>
						Dash Send: <b>12 777 999.9556 mDASH</b>
					</li>
					<li>
						PrivateSend Transactions: <b>1256</b>
					</li>
					<li>
						Dash Mixed: <b>3 720 184.7614 mDASH</b>
					</li>
					<li>
						InstantSend Transactions: <b>542</b>
					</li>
					<li>
						Tip Accounts: <b>1044</b>
					</li>
					<li>
						Tips: <b>380</b>
					</li>
					<li>
						CoinFlips (Bot Game): <b>2</b>
					</li>
					<li>
						Lottery Tickets (Bot Game): <b>0</b>
					</li>
				</ul>
				<br />
				<br />
				<h3>11. May 2018 Update</h3>
				<ul>
					<li>Hits: 63996</li>
					<li>
						Pages visited: 27066 (mostly main page as it contains all javascript, other pages are
						just help)
					</li>
					<li>
						Average response time: 0.9s (until site is fully loaded for the end user, we plan to
						optimize some things here)
					</li>
					<li>Total Sessions (unique users): 5758</li>
					<li>
						Tips started of strong and whenever Dash price went up, we saw less tipping activity,
						now with a low price more tipping (strange world)
					</li>
					<li>282 people have active tipping accounts (Discord, Twitter, Reddit)</li>
					<li>174 tips have been send out so far</li>
					<li>711 PrivateSend tx were send through MyDashWallet.org</li>
					<li>1507.463 DASH has been mixed for those PrivateSend tx </li>
					<li>1899 Normal tx were send through MyDashWallet.org</li>
				</ul>
			</div>
		)
	}
}
