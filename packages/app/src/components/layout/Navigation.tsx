import { Popover } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "utils/styles";
import { WalletConnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WrappedImage } from "../common/WrappedImage";
import { LOGO } from "../../utils/images";

const Navigation = () => {
    return (
        <>
            {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
            <Popover
                as="header"
                className={({ open }) =>
                    classNames(
                        open ? "fixed inset-0 z-40 overflow-y-auto" : "",
                        "bg-gray-900 shadow-sm lg:static lg:overflow-y-visible"
                    )
                }
            >
                {({ open }) => (
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="relative flex justify-between py-4">
                            <div className="flex lg:static xl:col-span-2">
                                <div className="flex flex-shrink-0 text-white font-bold text-xl">
                                    <a className={"flex items-center gap-x-2"} href="#">
                                        <WrappedImage
                                            className="block h-8 w-auto"
                                            src={LOGO}
                                            width={48}
                                            height={48}
                                            alt="Your Company"
                                        />
                                        Seagull Finance
                                    </a>

                                </div>
                            </div>
                            <div className="lg:flex lg:items-center lg:justify-end xl:col-span-4">
                                <WalletMultiButton
                                    className="ml-6 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Popover>
        </>
    );
};

export default Navigation;
