import placeHolder from "/public/placeholder.png";
import bSOL from "/public/icons/bSOL.png";
import mSOL from "/public/icons/mSOL.png";
import SOL from "/public/icons/SOL.png";
import logo from "/public/logo.png";
import bonk from "/public/icons/bonk.png";

import { ImageLoaderProps } from "next/image";

// Custom Loader
export const customLoader = ({ src, quality }: ImageLoaderProps) => {
    return `${src}${quality ? "&q=" + quality : ""}`;
}

export const PLACEHOLDER = placeHolder;
export const ICON_B_SOL = bSOL;
export const ICON_M_SOL = mSOL;
export const ICON_SOL = SOL;
export const LOGO = logo;
export const ICON_BONK = bonk;