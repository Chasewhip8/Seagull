# Seagull Socks JIT Markets
Seasgull JIT markets provide a composable layer for users, and protocols, to leverage auctions on SPL tokens. This readme will summarize a high level overview of how the markets function, why users should use them, and lastly why you might consider leveraging them for your protocols.

# The Concept
Users can place orders with a set number of parameters as follows:
 - lowest_price - The lowest price acceptable
 - a_end - Auction end slot
 - order_side - Buy or Sell

Once an order is placed, it can only be cancelled before it has a filler. Fillers by another one providing a better price, this mechanism incentives giving the user the best price possible.

If an auction has been placed, filled, and the current slot is past the auctions set expiration. It is ready to be settled by anyone, although the filler and the user are enforced so no money draining today.

Anyone can still fill the order until the funds have been settled. This mechanism incentives fillers to settle the order into the users account as fast as possible and negates the need for the user to claim the assets later on, they show up in their wallet!

## Use Cases
### Tighter On-Chain Spreads
Allowing time for Market Makers to hedge their position can be leveraged for tighter spreads on chain where there is a price discrepancy between markets. A merket maker can fill the order at a higher price than on-chain but lower than on a centralized exchange for instance, and hedge their position until the auction is finished. Allowing for both the user to get a better price, and for markets to be more efficient.

## Better-Priced Liquid Unstake
Since Solana's unstake mechanism is deterministic and revolves around the epoch schedule a user can set the auction end to a time they feel comfortable with before the epoch ends. Makers can then step in and fill the order while hedging the position elsewhere as the current redeem rate and length of the auction is known. This allows for tighter spreads on liquid unstaking rather than needing to rely on the on-chain liquidity or amm pool to backstop the liquid unstake with a fee, 

## Bonk
Bonk has emerged and is strapped with perpetual futures markets on centralized and decentralized exchanges. Using the same logic in the first use case we can provide better spreads for orders.

## The Stack (so far)
This repository contains the following:
 - Seagull Socks JIT Market Program
 - Front End for interacting with the program
 - SDK for interacting with the program
 - Maker Bot (example) to demonstrate a working market

**Warning: All code is unaudited and subject to security vulnerabilities, use at your own risk.** 

## What can be improved?
Due to the lack of time the Front End did not meet up to our initial expectations, it is functional, however it is not ready for release and is missing order management features which are built into the contract but not expressed well in the app.

There are additionally some improvements that can be made to the smart contract in the way orders are iterated and stored which will be implemented eventually.

## Conclusion
Thank you Lamport DAO and all the sponsors for enabling this kind of community event, truly inspiring enough to make me learn how to write smart contracts in a week and produce this. I do fully intend to bring this product to market in some way, shape, or form, although it may be another couple weeks before that happens as it does need some polish.