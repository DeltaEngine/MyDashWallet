import React, { Component } from 'react'

export class ScriptHack extends Component {
	render() {
		var addressesResearch = `Funds from an early user hack in June where hacker send to these addresses:
"XhYmBwXFA9AsjCYQ7kTFkywfwTKxrDQjqW", 
"XvFudE8gYSkCQCSN58obu8B9YyCA2YXj22",
"Xhd3VWkLiTA1LnZLPxM1PEVTDE6fNenULr",
"XyamW7BkMJpLs5GHuENdBtgNoP7mu7MVwa",
"XqUsAzkw7TLmqre48z6jWpcPRG3Fzukf1w",
"XroBamnozjJ6R2yGa9dCwZmQz88zLdC2Ry",
"XeSk7pe85GbTG4FqDZ7sD1gjyeAdGdxeL1",
"XuaXq9o5ptPgBhXfBvRhqHHLqTBTXGmsc4",
"XrMaMmuuu7EHEGkHGVV3b7o9EsUvWdKPR6",
"XyamW7BkMJpLs5GHuENdBtgNoP7mu7MVwa",

//ip:185.220.101.25 (tor node, netherlands, zwiebelfreunde)
//format: target address, then all incoming addresses
//Mixing: "Time" : ISODate("2019-06-19T15:05:52.933+0000"), "Ip" : "185.220.101.25", "TotalIncomingAmount" : "137.37199994", 
"Xgpauq14nwnRq79beoRSMxqr1SpNjrkV1z", 
"XqUsAzkw7TLmqre48z6jWpcPRG3Fzukf1w",
//"Time" : ISODate("2019-06-19T15:09:43.055+0000"), "Ip" : "185.220.101.25", "TotalIncomingAmount" : "48.51799994", 
"XurojPfqb3FuFhmNtrvB8LCugHXWCMHcDw", 
"XuaXq9o5ptPgBhXfBvRhqHHLqTBTXGmsc4",
//Mixing: "Time" : ISODate("2019-06-19T15:04:59.979+0000"), "Ip" : "185.220.101.25", 
"XsLwmnjR8ggjrampvQkr6xDoCkS6Rx7p7e", 
"Xhd3VWkLiTA1LnZLPxM1PEVTDE6fNenULr",
//Mixing "Time" : ISODate("2019-06-19T15:09:09.485+0000"), "Ip" : "185.220.101.25", 
"XkdVd2VeGbQ9e67586bw658fUHkLG2L1W4", 
"XeSk7pe85GbTG4FqDZ7sD1gjyeAdGdxeL1",
//Mixing: "Time" : ISODate("2019-06-19T15:08:36.602+0000"), "Ip" : "185.220.101.25", 
"XiVCcWuCvHiAMkHxfSJLQSV7DDuNSiekug",
"XroBamnozjJ6R2yGa9dCwZmQz88zLdC2Ry",
//Mixing: "Time" : ISODate("2019-06-19T15:06:24.301+0000"), "Ip" : "185.220.101.25, (6/19/2019 3:06:32 PM), (6/19/2019 3:06:41 PM), (6/19/2019 3:07:32 PM), (6/19/2019 3:07:38 PM)", "TotalIncomingAmount" : "163.69499994", 
"XgEGot9VP9MWwomb8UohdXFzgrSVdBt6XB", 
"XsTktDuYSsinvhDWQesdXwaDyFhuKfu3bf", 
"XcFre8KuSPrR5AoTB6x5e656t1ndwcxvi1", 
"XrDmyBVtDdjTKP7jPnvFzAbQLEf79Ledcn", 
"XuJSwGUbyPNoe7YPVRBnezG9p2kENA3CgR", 
"XbajKWqh28cVPnsrp7CjystyaYtdLXoRMj",
//Mixing: "Time" : ISODate("2019-06-19T15:10:06.783+0000"), "Ip" : "185.220.101.25, (6/19/2019 3:10:34 PM)",
"XtgSBamrzVZFD2N9V5tqf9cUisoALBrEdE", 
"Xhx3JYHLaggjLeMFScGXQ36VPjjut8LB1A", 
"XrMaMmuuu7EHEGkHGVV3b7o9EsUvWdKPR6",

//hack 2019-07-12, hacker withdrew a lot of user funds after the news got out:
//https://explorer.mydashwallet.org/tx/fad6ab3b5e855845b5286a3376b8f382f0bfc564151f28012d917f0f08e32d31
"XpztqBvDWqF7fgjPxjT94RmcJHLtZmySe7", //0.56950251 DASH (S)
"Xedgrz2g8k94V5yJTSvdY57Z9NUKg5eEGd", // 535.1 DASH (S), merged from 8 user balances:
"XtDwpSHgPLkCsVoSefFQYWh3xxxwKRv697", //0.01526251 DASH (S)
//"Xedgrz2g8k94V5yJTSvdY57Z9NUKg5eEGd", //same, 0.5 DASH (S)
"XfaihaBsQjaUTDu1CGahUibhTN6iRvFvK4", //input 0.01268795 DASH
"Xs5hQM7PzrXVeU48fDoDjyCPUg8ueXg4o4", //input 0.16702179 DASH
//"XtDwpSHgPLkCsVoSefFQYWh3xxxwKRv697", //input 0.01526251 DASH, see above
"XrH1XPf374ZuTc8WxAi1nzd881TVck6n7V", //0.00496701 DASH (U)
"XpmHVXM4z244R9mYxTJ1JPwj8x5hpNKEW2", //0.19 DASH (S)
//many hacker funds ended up here: https://explorer.mydashwallet.org/address/XqzFSeUhgj8Pe7THo9V1pCQD35unfcTPYi
"Xnpauv9jxwJhPXBHv4MkJWxfybxDFUZok9", //75 DASH (S)
"XyTRgZzJJwUNVuyxK9S1B1pETfQkH8VYhJ", //655.407072 DASH (S)
//got split up into 75-85 DASH chunks: https://explorer.mydashwallet.org/address/XyTRgZzJJwUNVuyxK9S1B1pETfQkH8VYhJ
"XkFrfkgTef5TpuBZSWvchghdJjHUgud98c", //85 DASH
"Xnpauv9jxwJhPXBHv4MkJWxfybxDFUZok9", //75 DASH
"XsEEKSMoDX4ucAnMfKs66Yxk3g2jrKPxkP", //75 DASH
"XddZJFiE6E4NZbGnT4FWNfcdFRbQWVbZGJ", //34.99999478 DASH (S)
"XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5", //200 DASH (S)
//XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5 send 720 DASH+ to these 4:
"Xb8zJSTiqPWgY8rPcrQacLxy8a6zE66tuz", //33.16992536 DASH (S), 1276tx, might be binance again
"Xq2Y3GZFYGYEAcpZbt3kEAZKg1ahjbYmiN", //336.83007202 DASH (S)
"XikuioSqhy9rZ8D97Mc5aGqqasjUjeFVGw", //58.5 DASH (S)
"XvL2ZzaoS4XUduCUx1cNTG4tjwJC71roih", //291.49999738 DASH (S)
//655 DASH chunk, ended up in above addresses too: 
"XjijzXrm55trCqnXVTt4Q9nNBLzAnb2v66",
"XkFrfkgTef5TpuBZSWvchghdJjHUgud98c", //85 DASH (S)
"XpiPfezHxeD6CaBrQK8eztJp29F2Eya8yv", //495.38446974 DASH (S)
"XebukqLzpzKmruxZm7KPiVdgh7bYZptZ1R", //100 DASH (S)
"XcAyAXLzkLmztUYkLYWJ8fKSD26vJ1Apzr", //395.36186974 DASH (S)
//another 320 DASH chunk ended up here: https://explorer.mydashwallet.org/address/XvxUU4ocz1qzkXdi1xpxHtjfEdWZGVbiY5
"XvxUU4ocz1qzkXdi1xpxHtjfEdWZGVbiY5",
"XpcTeqwcVqcv83xaHpNfXfpWb6fNtoroRe", //75 DASH (S)
"XoE71XEDkM3kNDGagytf1qXhXULRt62nGD", //245.36186522 DASH (S)
//some smaller chunks left over:
"XvL2ZzaoS4XUduCUx1cNTG4tjwJC71roih",
"XvJ8QFX3tk3TAbfEDeGiCs39x3yi3wnkHW", //98.05675489 DASH (U)
"Xv7Eqn9hTpRQB75nchgBJt1QFrAZMR4Qi4", //193.44323987 DASH (S)
//XuStaEySprc3B49yFnnaV9Rpv39B6CwhVM is actually the binance dash wallet address of the hacker:
//https://explorer.mydashwallet.org/address/XuStaEySprc3B49yFnnaV9Rpv39B6CwhVM
//unspent left over amounts (might be another binance hotwallet address):
"XtQsgt3U3Zs4yDxDF2Nyix9cBcpfzR1cTG", //413.68710851 DASH (U)
"XnrahymCT6JiX8gEGZ7zKaTmxjpWSpeG2T", //31.57996351 DASH (U)
"XayfNqJibzPF1nmEDhGTxggWJ5AwCQV4Cs",
//https://explorer.mydashwallet.org/address/XvCMjYtKFpc6Cg9BQzqFTrPLJuGpGfRnCN also seems to be a hacker binance hotwallet dash address
"XvCMjYtKFpc6Cg9BQzqFTrPLJuGpGfRnCN",
"XikuioSqhy9rZ8D97Mc5aGqqasjUjeFVGw", //51.7 DASH (U) https://explorer.mydashwallet.org/address/XikuioSqhy9rZ8D97Mc5aGqqasjUjeFVGw, also see above, reused address, maybe also binance?
/*MyDashWallet update early 2019-07: funds were mixed and are still sitting still for 2 days now, no movement yet (most of the funds)
funds at https://explorer.mydashwallet.org/address/XurojPfqb3FuFhmNtrvB8LCugHXWCMHcDw  (49.49 DASH) are still unspent for 2 days now
funds at https://explorer.mydashwallet.org/address/XkdVd2VeGbQ9e67586bw658fUHkLG2L1W4  (143.99 DASH) are still unspent for 2 days now
funds at https://explorer.mydashwallet.org/address/XiVCcWuCvHiAMkHxfSJLQSV7DDuNSiekug (199.9979 DASH) are still unspent for 2 days now
funds at https://explorer.mydashwallet.org/address/XtgSBamrzVZFD2N9V5tqf9cUisoALBrEdE (146.1775 DASH) are still unspent for 2 days now

The address tracked XsLwmnjR8ggjrampvQkr6xDoCkS6Rx7p7e from yesterday saw some movement today and we could track some of the transaction made from this address in these two transactions:
https://explorer.mydashwallet.org/tx/a49b5ece64125044aac2704964dc1321e9ddad93c1c1d09bd394e943dc9f46a4 
https://explorer.mydashwallet.org/tx/08f8cd637d84bb2be94fe22987a2f212d2dcff09221385379769ab362f499871 
Both those where previously mixed from your original address: Xj9BMU1SpfEUyJcih7d9nYn9ziXQquP5aQ (which was sitting mostly on the first few addresses I send last time, XhYmBwXFA9AsjCYQ7kTFkywfwTKxrDQjqW, etc.)
Its not much, but your funds are currently parked at https://explorer.mydashwallet.org/address/XkY58UD6BnPauY9nCdZurgGsHcsRxeeaGF
The better news is that with all this movement we have a much clearer picture on the IP of the hacker and where he is keeping the funds. If you have any more information, ip addresses, trojan involved, police information in case you contacted some cybercrime org, or if you could track some more addresses (there are hundreds by now, this is not easy to keep track of), let us know so we can add them to the tracking lists:

 20.12 to Xu1CtxKo5wijt2kGdvuyiDktoajV6Mo6ZB (PrivateSend: False, change 0.13320618 to XmzY4NJTJkfFu1sm1GTuAZSm17ea8pHjaj)
 Redirecting mixing request from
 08f8cd637d84bb2be94fe22987a2f212d2dcff09221385379769ab362f499871|1|
 a49b5ece64125044aac2704964dc1321e9ddad93c1c1d09bd394e943dc9f46a4|1|
 all from address: XsLwmnjR8ggjrampvQkr6xDoCkS6Rx7p7e
 (was sentTo=Xu1CtxKo5wijt2kGdvuyiDktoajV6Mo6ZB, remainingAddress=XmzY4NJTJkfFu1sm1GTuAZSm17ea8pHjaj)
IP: 109.70.100.21 (another tor exit node, the hacker is very careful, sadly we can't link him up by his IP used)
TOR-EXIT--FOUNDATION-FOR-APPLIED-PRIVACY
-> 2019-06-20: parked at: XkY58UD6BnPauY9nCdZurgGsHcsRxeeaGF

We keep looking at that tor exit node and all the new addresses/changes and leftovers, they all can be linked 100% to XhYmBwXFA9AsjCYQ7kTFkywfwTKxrDQjqW)
0.1332 DASH change was send to: XnDbMeGVVo48FzgEjvV8ivku7TEpedub9P
27.746 DASH bigger leftover chunk: https://explorer.mydashwallet.org/address/XjYJutswUU7JnHrpMzUY2k1H99K9Le5onR - keep watching this one!
was mixed and is empty: https://explorer.mydashwallet.org/address/XyxGZ1G8tBWt6wYw5kLnMxwSg3bnw6dMAu
Not sure, but it seems the hacker was collecting funds here (old address, many changes collected, might be his binance deposit address, see below): https://explorer.mydashwallet.org/address/XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5 
involved addresses (might be binance reshuffling funds, many tx on each address):
(was 0.01 DASH) Xg7UsFxv8KtyUww516byiuNvmiogq6JFfa
(was 173.424 DASH) XjJTmEbCQDHohxnfTHdwdTgtksnVh743dV
(was 1.5593343 DASH) Xf26UKHMDBRBLfZpxB4sARC2iaN5DdyqQG
(was 0.00684583 DASH) XcKtnQEgzfHpGNjGhMJhK8hUayZKrrUhu9
(was 0.00285842 DASH) XiRvHBLJbBQFoV5Rmv4wZAMm6Ygcc4NRJi
(was 0.00428763 DASH) XsU5e6cDX1KkuEai2EemUb3s14LNPJVC1y
(was 125 DASH) XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5
(output: 0.01051374 DASH (U)) Xd1ZSrrwvtHVtvxFrB9YdV2FMke4VRDWBa
(output 299.998 DASH (U)) XuDGfQwwdekAYU39tzy1UhxfzremXaAvRa        - this is the most important address, keep watching it! there are 600+ DASH on here
sadly the trace stops here as funds are coming from XfcLDYdv97tc8YYbQqmR1gxBdLq4xfPNdy, which is binance hotwallet, so any of these addresses might just be users on binance with their deposit accounts (feel free to contact binance, they might help you, we never had much luck contacting them)

// other movements (probably done on other wallets, we could't track any of these automatically)
Xgpauq14nwnRq79beoRSMxqr1SpNjrkV1z got 137 DASH, all moved
send 50 DASH (S) to XmRCLmyVrrBNHR8nTMPbMtF6ie5nLpzJas
send 50.00098216 DASH (S) to XvT3CFrgQ1LHF3Mjjm7Hxy4Qv5uyAKe8Qo
send 30 DASH (U) to XdMaepeoqoSWtwtBFeiYJixzAi6qCpquWS - this is a leftover, watch this address!
send 7.33902028 DASH (S) to XvT3CFrgQ1LHF3Mjjm7Hxy4Qv5uyAKe8Qo
- XvT3CFrgQ1LHF3Mjjm7Hxy4Qv5uyAKe8Qo
send 25 DASH (U) to Xc7hTn8KZPon3bWZcMG1gfv8h5YWFnCgMb
send 25.0009799 DASH (S) Xy1MysA6zyDSUsEb29ZJg31h5Rk25nkKED
merged with Xy1MysA6zyDSUsEb29ZJg31h5Rk25nkKED and send to XgZzeFAAgmUgvV7RAGyNQ4UyatHBeCDCj2
ended up in XcM9V5rJHUS9JEnjYrXxM2rgBspMf2Bi3Q, which is a big wallet with 194 tx, maybe from some exchange
- also changes leftover at XugYFqUq6ZJ3XHYAw6iKxpdRHUV8nTQzEV, which is binance again sending to some user: https://explorer.mydashwallet.org/tx/564859d773287e67b689e37f9cf036f8d699ec00146447746d8530db91428294
https://explorer.mydashwallet.org/address/XmRCLmyVrrBNHR8nTMPbMtF6ie5nLpzJas  also had 50 DASH yesterday from above and was spend in https://explorer.mydashwallet.org/address/XugYFqUq6ZJ3XHYAw6iKxpdRHUV8nTQzEV as well, so this might be binance hotwallet as well

funds at https://explorer.mydashwallet.org/address/XgEGot9VP9MWwomb8UohdXFzgrSVdBt6XB (163.656 DASH) where spent at:
https://explorer.mydashwallet.org/address/XeMJJ1mHLUc3E2mewKFXtWiKBXbrXmL4We (big merge with above wallet addresses as well) 
41.4516 DASH XyxGZ1G8tBWt6wYw5kLnMxwSg3bnw6dMAu
50 DASH XeMJJ1mHLUc3E2mewKFXtWiKBXbrXmL4We
5.5239 DASH XdCJFQgiBGQY7iQLz2Z6W1FSuNs2UPwyo7
5.93999994 DASH Xq9QKt5U3qBdnn6FqeudPkvy7hDmtBVBaN
40 DASH Xc2vbfXreJEhFdU1PRDbxaNk3L7qy5XJ5G
9.90185 DASH XmAkEeBnZaTTmho7mk1hhNNtvTWssaeb7b
39.68989994 DASH Xg4qkhhKumsSDtZQgCRcigwVcJhvd7qRxu
2.50703874 DASH (U) XnRrsVvzaa53vpUJg5WPb2NbAK6Xe8G6VC
190 DASH (S) to XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5 - this seems to be the hacker binance wallet deposit address!

https://explorer.mydashwallet.org/address/XkyaE22uUXDGAYi9hbVQ5xWZPRRHHyf4gg had some movement into 
https://explorer.mydashwallet.org/address/Xc2vbfXreJEhFdU1PRDbxaNk3L7qy5XJ5G  (see above, merged)
and  https://explorer.mydashwallet.org/address/Xq6LfkuqJdJ291LcQutmCArtf9MbPN3wtB (33.6559999 DASH, unspent 2 days)
leftovers where spend at https://explorer.mydashwallet.org/address/XeyH1pQSV2p22vhsZWGHwCGJ1fAtjpRDBB   (another binance wallet deposit address)
and merged by binance in this tx: https://explorer.mydashwallet.org/tx/564859d773287e67b689e37f9cf036f8d699ec00146447746d8530db91428294

// Later addresses used by the hacker
"Xu1CtxKo5wijt2kGdvuyiDktoajV6Mo6ZB",
"XmzY4NJTJkfFu1sm1GTuAZSm17ea8pHjaj",
"XnDbMeGVVo48FzgEjvV8ivku7TEpedub9P",
"XjYJutswUU7JnHrpMzUY2k1H99K9Le5onR",
"XyxGZ1G8tBWt6wYw5kLnMxwSg3bnw6dMAu",
"XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5",
"XuDGfQwwdekAYU39tzy1UhxfzremXaAvRa",
"Xgpauq14nwnRq79beoRSMxqr1SpNjrkV1z",
"XmRCLmyVrrBNHR8nTMPbMtF6ie5nLpzJas",
"XvT3CFrgQ1LHF3Mjjm7Hxy4Qv5uyAKe8Qo",
"XdMaepeoqoSWtwtBFeiYJixzAi6qCpquWS",
"XvT3CFrgQ1LHF3Mjjm7Hxy4Qv5uyAKe8Qo",
"Xc7hTn8KZPon3bWZcMG1gfv8h5YWFnCgMb",
"Xy1MysA6zyDSUsEb29ZJg31h5Rk25nkKED",
"XgZzeFAAgmUgvV7RAGyNQ4UyatHBeCDCj2",
//another binance hot wallet most likely: "XcM9V5rJHUS9JEnjYrXxM2rgBspMf2Bi3Q",
"XgEGot9VP9MWwomb8UohdXFzgrSVdBt6XB",
"XeMJJ1mHLUc3E2mewKFXtWiKBXbrXmL4We",
"XkyaE22uUXDGAYi9hbVQ5xWZPRRHHyf4gg",
"Xc2vbfXreJEhFdU1PRDbxaNk3L7qy5XJ5G",
"Xq6LfkuqJdJ291LcQutmCArtf9MbPN3wtB",
"XeyH1pQSV2p22vhsZWGHwCGJ1fAtjpRDBB",

//Note: All this information is extracted from the blockchain and any guesses made here on account types, exchanges, hot wallets might be wrong, so any suspected address has to be checked and monitored to give more clues.
	`
		return (
			<div>
				<h1>Script Hack 2019-07-12</h1>
				<div>
					<span style={{ color: 'indianred' }}>
						This new website is not affected, the only scripts this site loads are React,
						dashcore-lib, ledger-js and TrezorConnect, all from safe sources.
					</span>
					<br />
					<br />
					Sadly on the old website an external site (greasyfork.org) got a user account hacked,
					which provided a CryptoJS script that was used early 2018 for decrypting byte data on
					mydashwallet.org, the code was already disabled in Q2 2018, but the script hasn't been
					removed from the old website in time. The old site also carries a lot of fluff from
					MyEtherWallet, which it was derived from, the new site is completely rewritten and doesn't
					carry any of the old messy code. In any case since our source code is freely available,
					our sites gets copied often, scammers are trying to trick users in similar looking
					websites with slightly different urls and due to the fact everything is out in the open
					and code is loaded from many places, there are many attack vectors and it is not easy
					keeping everything up to date. One little messup is all you need and other security goes
					into the toilet.
					<br />
					<br />
					After Dash Core{' '}
					<a href="https://twitter.com/Dashpay/status/1149552764923465735">
						found out about the script hack
					</a>{' '}
					it was immediately removed.{' '}
					<a href="https://github.com/JasonBarnabe/greasyfork/issues/621">
						There isn't much information about the actual hack on greasyfork.
					</a>
					<br />
					<br />
					Some in the Dash Community are still watching the hacker addresses and funds, if you have
					any information or can help (e.g. contacting binance about the hacker deposit address
					XgR4yd8Cms5VwQioCh7ZNC7P4pWAdxf8u5, we can't get anyone to help or respond), please
					contact support@mydashwallet.org! We are also working together with law enforcement once
					contacted (only public information below goes to them, we keep all unaffected user data
					private and don't have much anyway as we don't see local wallets and don't track normal
					users)
					<br />
					<br />
					So far we were able to recover the following funds, but that is only because the hacker(s)
					continued to use MyDashWallet Mixing service. Since the news has been out the hacker(s)
					seem to be silent and we haven't seen much activity since.
					<ul>
						<li>
							20.12 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5">
								270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5
							</a>
						</li>
						<li>
							0.13199994 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5">
								270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5
							</a>
						</li>
						<li>
							8.009 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/1d043552f51f2ae895754164c4b7b526579814f1064e338ddf6c37c86df71ddf">
								1d043552f51f2ae895754164c4b7b526579814f1064e338ddf6c37c86df71ddf
							</a>
						</li>
						<li>
							10.002 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/96333ecfb1bfabf8caf4f7d0739d0daad113bbd4efb4e4a32c46b0cc622fa54f">
								96333ecfb1bfabf8caf4f7d0739d0daad113bbd4efb4e4a32c46b0cc622fa54f
							</a>
						</li>
						<li>
							10.002 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5">
								270686a1e4bcefdf442eae7616e48f158df70ff9dee36181bbae66aca1b938d5
							</a>
						</li>
						<li>
							10.002 DASH{' '}
							<a href="https://explorer.mydashwallet.org/tx/337952bc8e81fb589c2543721dd80496ae78727e5d5f34f9e383664fbea65314">
								337952bc8e81fb589c2543721dd80496ae78727e5d5f34f9e383664fbea65314
							</a>
						</li>
						<li>
							<b>Total: 58.26699994 DASH</b> (20.12+0.13199994+8.009+10.002+10.002+10.002)
						</li>
					</ul>
					If you have more information, please contact Support@MyDashWallet.org. If you want to
					donate/recover funds you can use this address: XkY58UD6BnPauY9nCdZurgGsHcsRxeeaGF
				</div>
				<br />
				We are very sorry if you have been affected, we have to remind everyone that every user is{' '}
				<a href="/help">his own bank and responsible for his funds</a>, at no time did MyDashWallet
				have access to the user or hacker addresses or funds. Please contact
				Support@MyDashWallet.org with the following data to receive a percentage of any recovered
				funds. The percentage is based on how many people want to claim their funds back, every one
				that contacted us will be informed of this recovery fund.
				<ul>
					<li>
						The exact transaction(s) to fund your wallet (we can only compare those if you used a
						MDW node and used the site before, many users send us unrelated transactions)
					</li>
					<li>
						The exact transaction(s) from the hacker stealing your funds (we can only send recovered
						funds from the actual hacker we tracked, if your transaction is unrelated we cannot
						help, sorry)
					</li>
					<li>
						The address you want your recovered funds go to (this will happen by end of August 2019)
					</li>
					<li>A screenshot from MyDashWallet or any more information would also help</li>
				</ul>
				<br />
				<div>
					<h3>Tracking addresses/ip addresses/etc. during July 2019</h3>
					<textarea defaultValue={addressesResearch} style={{ width: '100%', height: '800px' }} />
				</div>
			</div>
		)
	}
}
