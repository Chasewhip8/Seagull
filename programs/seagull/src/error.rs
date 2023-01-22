use anchor_lang::error_code;

#[error_code]
pub enum SeagullError {
    #[msg("Order Queue is full!")]
    OrderQueueFull,

    #[msg("Order Queue is empty!")]
    OrderQueueEmpty,

    #[msg("The order at this price exists and is being filled already!")]
    OrderExistsAndFilled,

    #[msg("Their were no available orders to match the fill to!")]
    OrderNotMatched,

    #[msg("Order was not found!")]
    OrderNotFound,

    #[msg("Order is not cancelable!")]
    OrderNotCancelable,

    #[msg("The price is not tick aligned!")]
    PriceNotTickAligned
}