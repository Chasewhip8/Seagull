use anchor_lang::prelude::*;

#[event]
pub struct OrderMatchedEvent {
    pub order_id: u128,
    pub new_filler_id: u64,
    pub replaced_filer_id: u64
}

#[event]
pub struct OrderRematchFailEvent {
    pub original_order_id: u128,
    pub filler_id: u64
}

#[event]
pub struct OrderCompletedEvent {

}

#[event]
pub struct OrderFinalizedEvent {

}

#[event]
pub struct NewOrderEvent {

}

#[event]
pub struct OrderCancelEvent {

}