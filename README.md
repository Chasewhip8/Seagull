# Seagull Socks JIT Markets
Seagull JIT markets provide a composable layer for users- and protocols- to leverage auctions on SPL tokens. This README will summarize a high-level overview of how the markets function, why users should use them, and why you may consider leveraging them for your protocols.

## The Concept
Users can place orders with the following set number of parameters:
- lowest_price - Lowest price acceptable.
- a_end - Auction end slot.
- order_side - Buy or sell.

Once an order is placed, it can only be canceled before it has a filler. If another filler offers a better price, the previous filler is overridden. This mechanism incentivizes the fillers to provide the best possible price.

If an auction has been placed, filled, and the current slot is past the auctions set expiration slot, it is ready to be settled by any user.

Fillers can still provide a better price until the order has been settled. This provides an incentive for fillers to settle the order into the users account quickly and negates the need for the user to claim the assets later on, since the assets appear in their wallet.

## Use Cases
### Tighter On-Chain Spreads
JIT Markets allow time for Market Makers to hedge their position which can leverage price discrepancies between markets for tighter spreads on-chain. Theoretically, a Market Maker can fill the order at a higher price than on-chain but hedge with a lower price on a centralized exchange, and wait until the auction is finished to settle. This allows for both the user to get a better price and for markets to be more efficient.

### Better-Priced Liquid Unstake
Since Solana's unstake mechanism is deterministic and revolves around the epoch schedule, users can set their auction to end at their preferred time before the epoch ends. Market Makers can then step in to fill the order, hedge the position elsewhere at the current redeem rate, and settle when the auction finishes. This allows for tighter spreads on liquid unstaking rather than relying on the liquidity on-chain or AMM pool to backstop the liquid unstake features. These traditional instant unstake mechanisms also require a fee whereas the JIT market does not.

### Bonk
Bonk is strapped with Perpetual Futures markets on centralized and decentralized exchanges. Using the same logic, as above in Tighter On-Chain Spreads, Seagull can provide better spreads for orders and potentially burn accrued fees.

## The Stack (so far)
This repository contains the following:
- Seagull Socks JIT Market Program
- Front End for interacting with the program
- SDK for interacting with the program
- Market Maker Bot (example) to demonstrate a working market

**Warning: All code is unaudited and subject to security vulnerabilities, use at your own risk.**

## What can be improved?
Due to the short time frame, the Front End did not meet up to our initial expectations. It is functional, but it is not ready for release. The Front End is missing order management features which are built into the contract but not expressed very well in the app.

There are some improvements that can be made to the smart contract in the way orders are iterated and stored which will be implemented eventually.

## Conclusion
Thank you Lamport DAO and all the sponsors for enabling this kind of community event. You have truly inspired me enough to make me learn how to write smart contracts in a week and produce this. I do fully intend to bring this product to market in some way, shape, or form.