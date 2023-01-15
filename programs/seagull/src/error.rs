use anchor_lang::error_code;

#[error_code]
pub enum SeagullError {
    #[msg("Order Queue is full!")]
    OrderQueueFull,
}