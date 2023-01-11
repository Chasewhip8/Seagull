# Seagull JIT Spot Market
A JIT(Just in Time) auction mechanism can assist in tightening spreads on orders by allowing for Market Makers
to properly hedge the other leg of the order on a more efficient, better priced, often CEX market. This should result 
in tighter spreads to be achieved as the counterpart does not need to maintain a hedge constantly like on a 
CLOB(Central Limit Order Book).

## Design Outline
The following sections will reference the following placeholder values for explanation.

 - `t` Current Time

Market Account
 - `quote_mint` Mint of Quote Asset
 - `base_mint` Mint of Base Asset
 - `a_max_t` Maximum Auction Duration Time
 - `a_min_t` Minimum Auction Duration Time
 - `b_max_t` Maximum Backstop Duration Time
 - `b_min_t` Minimum Backstop Duration Time

#### Auction Phases
 - `Auction Ongoing` Auction Mechanism (detailed below)
 - `Backstop Ongoing` Backstop Mechanism (detailed below)
 - `Completed` Auction has been completed either by expiry of all phases or a successful fill.

### Auction Mechanism
#### Place Auction Order
The user places the order on-chain with the following attributes defined in the order. Each order belongs to a pre-specified
market where assets are already well-defined.
- `size` Position Size
- `asset_account` Account holding asset for order.
- `side` Position Side (Buy or Sell)
- `a_end` Auction End Time `t + (a_min_t < duration < a_max_t)`
- `b_end` Backstop End Time `t + (b_min_t < duration < b_max_t)`
- `expected_return` Minimum Return (in base or quote asset atoms depending on side)
- `fill_request` Fill Request, null if none
- `completed` Boolean controlled by program weather order is completed via expiry or fill. Filled if asset_account.balance == 0, expired if not.

This order is then placed in a CritBit order queue. Note that we might want to try and sort the collection by duration left, maybe 
instead of a fixed time we use the slot when the auction ends, which would require changing the above structure of the order as well.

#### Auction Fill Request
This action is done on a specific **Auction Order** placed above. Auction Fill Requests cannot be cancelled until a better request
overtakes it by providing a better price. 

A `Filler Account` needs to be created by the auction filler which will hold the funds and lock all outstanding fill requests funds inside.
This way we are not moving assets back and forth between accounts and the auctions should be less computationally intensive on the network.

Makers will place the following on chain Auction Fill Request with the following attributes.
 - `order` Auction Order that is in 
 - `filler` **Filler Account** with enough funds to fill the order

This fill request will be assigned to the orders `fill_request` if it is better than the existing request. Orders can only be appended when
time is less than the auction end.

#### Order Crank and Fill
A keeper instruction needs to be in place to advance the order, this is a permission-less instruction and will do the following in 
specific scenarios.

Optional `filler` **Filler Account** with enough funds to fill the order in case of backstop phase entry.
Order is defined as `order`. Execute top down.

```
// Auction Filled Already
IF `order.completed` exit with error `Order has already been completed!`

// Auction Execute Fill
IF `t >= order.a_end && order.fill_request.filler != null` Fill the order and swap assets, set `order.completed` to true.

// Backstop Phase Fill
ELSE IF `filler != null && t >= order.a_end && order.fill_request.filler == null && t < order.b_end` Attempt to fill the order with the filler 
accounts funds. If filled, set `order.completed` to true.

// Order Expiry
ELSE IF `!filled && t >= order.a_end && t >= order.b_end` Set `order.completed` to true.

IF `order.completed` Remove order from the CritBit queue

ELSE OK.
```

### Backstop Mechanism
As you may have seen mentioned above the backstop phase happens after an auction phase has ended with no filler. This
opens the order up to be filled by an atomic transaction which could be a swap via an aggregator such as Jupiter or 
Prism. This allows orders to always be filled as we can fill these via the client who placed the order as well. This 
does however mean that slippage is really important as someone can come in and give the lowest possible fill price 
depicted by the order and it will go through!