import placeHolder from "/public/placeholder.png";

import { ImageLoaderProps } from "next/image";

// Custom Loader
export const customLoader = ({ src, quality }: ImageLoaderProps) => {
    return `${src}${quality ? "&q=" + quality : ""}`;
}

export const PLACEHOLDER = placeHolder;