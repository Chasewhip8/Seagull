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
pub struct OrderPlaceEvent {
    pub order_id: u128,
    pub size: u64
}

#[event]
pub struct OrderEditEvent {
    pub order_id: u128,
    pub size: u64
}

#[event]
pub struct OrderCancelEvent {
    pub order_id: u128,
}

#[event]
pub struct OrderSettledEvent {
    pub order_id: u128,
    pub settled_price: u64,
    pub settled_size: u64
}