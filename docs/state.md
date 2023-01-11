# Enums
**Side** - `BUY, SELL`


* [PDA Layouts](#pda-layouts)
  * [Market](#market)
  * [Order](#order)
  * [Filler](#filler)
  * [Fill Request](#fill-request)

# PDA Layouts
## Market
Account to hold information about the underlying market. 

| Name         | Type   | Description                     |
|--------------|--------|---------------------------------|
| `quote_mint` | Pubkey | Mint of Quote Asset             |
| `base_mint`  | Pubkey | Mint of Base Asset              |
| `a_max_t`    | u32    | Maximum Auction Duration Slots  |
| `a_min_t`    | u32    | Minimum Auction Duration Slots  |
| `b_max_t`    | u32    | Maximum Backstop Duration Slots |
| `b_min_t`    | u32    | Minimum Backstop Duration Slots |

## Order

| Name              | Type   | Description                                                       |
|-------------------|--------|-------------------------------------------------------------------|
| `size`            | u64    | Position Size                                                     |
| `holding_account` | Pubkey | ATA for holding asset for order                                   |
| `side`            | Side   | Position Side (Buy or Sell)                                       |
| `a_end`           | Slot   | Auction End Time `t + (a_min_t < duration < a_max_t)`             |
| `b_end`           | Slot   | Backstop End Time `t + (b_min_t < duration < b_max_t)`            |
| `expected_return` | u64    | Minimum Return (in base or quote asset atoms depending on side)   |
| `fill_request`    | Pubkey | Fill Request, null if none                                        |
| `completed`       | bool   | Weather or not the order is completed, weather expired or filled. |

## Filler

| Name            | Type   | Description                                                                 |
|-----------------|--------|-----------------------------------------------------------------------------|
| `owner`         | Pubkey | The user who is the filler                                                  |
| `base_account`  | Pubkey | A token account to hold funds used to fill orders                           |
| `base_locked`   | u64    | The amount of base funds locked in outstanding, unprocessed, fill requests  |
| `quote_account` | Pubkey | A token account to hold funds used to fill orders                           |
| `quote_locked`  | u64    | The amount of quote funds locked in outstanding, unprocessed, fill requests |

## Fill Request

| Name     | Type   | Description                                                               |
|----------|--------|---------------------------------------------------------------------------|
| `order`  | Pubkey | Order to attempt to fill                                                  |
| `filler` | Pubkey | Filler Account with enough funds to fill the order, funds will get locked |
| `price`  | f64    | Price of side to fill at with opposing side                               |
