import { FC } from "react";
import Image from "next/image";
import { ImageProps } from "next/dist/client/image";
import { customLoader } from "../../utils/images";

export const WrappedImage: FC<ImageProps> = (props) => {
    if (!props.src){
        return <></>;
    }
    // alt stuff is passed in so disable this lint
    return (
        <div className={"flex flex-col flex-shrink-0 justify-center"}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
                layout={"fixed"}
                {...props}
                loader={customLoader}
            />
        </div>
    )
}