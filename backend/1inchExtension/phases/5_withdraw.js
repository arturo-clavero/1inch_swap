

async function withdraw(self) {
//TODO LERA 
// 5. The 1inch relayer service ensures that both escrows,
// containing the required token and amount, are created,
// and the finality lock has passed, and then discloses the
// secret to all resolvers.
// 6. Utilizing the secret, the resolver unlocks their assets on
// the source chain, simultaneously revealing the secret to
// the public.
// 7. The resolver then uses the same secret to unlock the assets for the maker from the destination chain’s escrow,
// thereby finalizing the swap.

	//contracts[self.order.srcContractName].unlock(
	// 	self.order.sourceToken, 
	// 	self.order.amount
	// );
	//contracts[self.order.dstContractName].unlock(
	//	self.order.destinationToken,
	// 	self.order.exchangeQuote
	//);
	const someError = false;
	if (someError)
		await recovery(self);

	await self.nextAction();
}

async function recovery(self) {
// 	If neither party receives the designated assets on any chain
// before the timelock expires, any resolver can transfer
// these assets back to each respective owner.
// Additionally, the protocol introduces safety deposit mechanics. When a resolver deposits assets to the escrow,
// they include an additional amount of the chain’s native
// asset, called a “safety deposit”. The safety deposit goes
// to the executor of a withdrawal or cancellation transaction. This incentivizes resolvers to perform cancellations
// on behalf of the maker.
// 8. The resolver executes cancelation for the source chain
// escrow to return funds to the maker on the source
// chain.
// 9. The resolver executes cancelation for the destination
// chain escrow, returning their previously deposited assets and safety deposit.
}
module.exports = {withdraw};