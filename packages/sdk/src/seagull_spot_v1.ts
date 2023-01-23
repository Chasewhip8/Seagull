export type Seagull = {
  "version": "0.1.0",
  "name": "seagull",
  "instructions": [
    {
      "name": "initMarket",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "OrderQueue"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "quote_mint"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "Market"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "quote_mint"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "User"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Market",
                "path": "market"
              },
              {
                "kind": "arg",
                "type": "u64",
                "path": "user_id"
              }
            ]
          }
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSideAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sideMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sideHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "size",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "lowestPrice",
          "type": "u64"
        },
        {
          "name": "aEnd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fillOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "filler",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fillerSideAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sideMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sideHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fillerSide",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "fillerSize",
          "type": "u64"
        },
        {
          "name": "fillerPrice",
          "type": "u64"
        },
        {
          "name": "fillerExpireSlot",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleOrder",
      "accounts": [
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderUser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "orderUserAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderFiller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "orderFillerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "refundMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "refundAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        }
      ]
    },
    {
      "name": "claimUnsettled",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userQuoteAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userBaseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "quoteHoldingAccount",
            "type": "publicKey"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "baseHoldingAccount",
            "type": "publicKey"
          },
          {
            "name": "orderQueue",
            "type": "publicKey"
          },
          {
            "name": "minTickSize",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orderQueue",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queue",
            "type": {
              "array": [
                "u8",
                10128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "userId",
            "type": "u64"
          },
          {
            "name": "openQuote",
            "type": "u64"
          },
          {
            "name": "openBase",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OrderMatchedEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "newFillerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "replacedFilerId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderRematchFailEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "originalOrderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "fillerId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderPlaceEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "size",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderEditEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "size",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderCancelEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        }
      ]
    },
    {
      "name": "OrderSettledEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "settledPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "settledSize",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OrderQueueFull",
      "msg": "Order Queue is full!"
    },
    {
      "code": 6001,
      "name": "OrderQueueEmpty",
      "msg": "Order Queue is empty!"
    },
    {
      "code": 6002,
      "name": "OrderExistsAndFilled",
      "msg": "The order at this price exists and is being filled already!"
    },
    {
      "code": 6003,
      "name": "OrderNotMatched",
      "msg": "Their were no available orders to match the fill to!"
    },
    {
      "code": 6004,
      "name": "OrderNotFound",
      "msg": "Order was not found!"
    },
    {
      "code": 6005,
      "name": "OrderNotCancelable",
      "msg": "Order is not cancelable!"
    },
    {
      "code": 6006,
      "name": "PriceNotTickAligned",
      "msg": "The price is not tick aligned!"
    }
  ]
};

export const IDL: Seagull = {
  "version": "0.1.0",
  "name": "seagull",
  "instructions": [
    {
      "name": "initMarket",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "OrderQueue"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "quote_mint"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "Market"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "quote_mint"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "User"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Market",
                "path": "market"
              },
              {
                "kind": "arg",
                "type": "u64",
                "path": "user_id"
              }
            ]
          }
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSideAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sideMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sideHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "size",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "lowestPrice",
          "type": "u64"
        },
        {
          "name": "aEnd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fillOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "filler",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fillerSideAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sideMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sideHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fillerSide",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "fillerSize",
          "type": "u64"
        },
        {
          "name": "fillerPrice",
          "type": "u64"
        },
        {
          "name": "fillerExpireSlot",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleOrder",
      "accounts": [
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderUser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "orderUserAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderFiller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "orderFillerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "refundMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "refundAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        }
      ]
    },
    {
      "name": "claimUnsettled",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userQuoteAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userBaseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "baseHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteHoldingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderQueue",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "quoteHoldingAccount",
            "type": "publicKey"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "baseHoldingAccount",
            "type": "publicKey"
          },
          {
            "name": "orderQueue",
            "type": "publicKey"
          },
          {
            "name": "minTickSize",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orderQueue",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queue",
            "type": {
              "array": [
                "u8",
                10128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "userId",
            "type": "u64"
          },
          {
            "name": "openQuote",
            "type": "u64"
          },
          {
            "name": "openBase",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OrderMatchedEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "newFillerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "replacedFilerId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderRematchFailEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "originalOrderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "fillerId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderPlaceEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "size",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderEditEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "size",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OrderCancelEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        }
      ]
    },
    {
      "name": "OrderSettledEvent",
      "fields": [
        {
          "name": "market",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "orderId",
          "type": "u128",
          "index": false
        },
        {
          "name": "settledPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "settledSize",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OrderQueueFull",
      "msg": "Order Queue is full!"
    },
    {
      "code": 6001,
      "name": "OrderQueueEmpty",
      "msg": "Order Queue is empty!"
    },
    {
      "code": 6002,
      "name": "OrderExistsAndFilled",
      "msg": "The order at this price exists and is being filled already!"
    },
    {
      "code": 6003,
      "name": "OrderNotMatched",
      "msg": "Their were no available orders to match the fill to!"
    },
    {
      "code": 6004,
      "name": "OrderNotFound",
      "msg": "Order was not found!"
    },
    {
      "code": 6005,
      "name": "OrderNotCancelable",
      "msg": "Order is not cancelable!"
    },
    {
      "code": 6006,
      "name": "PriceNotTickAligned",
      "msg": "The price is not tick aligned!"
    }
  ]
};
