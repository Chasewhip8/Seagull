import { BN } from "@project-serum/anchor";
import { MarketSide, Side } from "./types";
import { BN_0, ID_RESERVED_SIDE_BIT, U64_MAX_BN } from "./constants";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";

export function getKey(price: BN, side: Side, user_id: BN): BN {
    return price.ushln(64).ior(user_id).ior(getSideBit(side)); // Upper bits: price, Lower bits: user_id, 64th bit is side.
}

export function getSideBit(side: Side): BN {
    return side == MarketSide.Buy ? ID_RESERVED_SIDE_BIT : BN_0; // TODO test this!
}

export function getPriceFromKey(key: BN): BN {
    return key.ushrn(64);
}

function getUserIdFromKey(key: BN): BN {
    return key.uand(U64_MAX_BN);
}

export function getSideFromKey(key: BN): Side {
    return getUserIdFromKey(key).iuand(ID_RESERVED_SIDE_BIT).eqn(0)
        ? MarketSide.Sell : MarketSide.Buy;
}

export function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            new PublicKey(walletAddress).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            new PublicKey(tokenMintAddress).toBuffer()
        ],
        ASSOCIATED_PROGRAM_ID
    )[0];
}

export function findMultipleAssociatedTokenAddress(
    walletAddress: PublicKey,
    ...tokenMintAddressList: PublicKey[]
): PublicKey[] {
    return tokenMintAddressList.map((tokenMint) =>
        findAssociatedTokenAddress(walletAddress, tokenMint)
    );
}