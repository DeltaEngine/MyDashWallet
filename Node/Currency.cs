namespace SocialCryptoBots
{
	/// <summary>
	/// Matches the internal mBTC=0, mETH=1, mLTC=2, mDASH=3, mBCH=4 numbering used on Fairlay.
	/// USD and EUR are used to display prices and are useful for the tipping on Reddit, Discord, etc.
	/// </summary>
	public enum Currency
	{
		// ReSharper disable InconsistentNaming
		mBTC = 0,
		mETH = 1,
		mLTC = 2,
		mDASH = 3,
		mBCH = 4,
		COLX = 5,
		USD,
		EUR
	}
}