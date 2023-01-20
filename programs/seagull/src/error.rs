use anchor_lang::error_code;

#[error_code]
pub enum SeagullError {
    #[msg("Order Queue is full!")]
    OrderQueueFull,

    #[msg("The order at this price exists and is being filled already!")]
    OrderExistsAndFilled,

    #[msg("The order at this price exists and is the opposite side!")]
    OrderExistsSideMismatch,

    #[msg("The order queue for the market was empty!")]
    OrderQueueEmpty,

    #[msg("Their were no available orders to match the fill to!")]
    OrderNotMatched,

    #[msg("Order was invalid!")]
    OrderInvalid,

    #[msg("Order was not found!")]
    OrderNotFound,
}