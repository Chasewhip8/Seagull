import { useEffect } from 'react'
import { removeNotification, selectNotifications } from "../stores/reducers/notificationReducer";
import { NotificationType } from "../models/types";
import { selectClusterConfig } from "../stores/reducers/configReducer";
import { WrappedImage } from "./common/WrappedImage";
import { useAppDispatch, useAppSelector } from "../hooks/common";

const NotificationList = () => {
    const notifications = useAppSelector(selectNotifications);
    const clusterConfig = useAppSelector(selectClusterConfig);
    const dispatch = useAppDispatch();

    return (
        <div
            className={`z-30 fixed inset-0 flex items-end px-4 py-6 pointer-events-none`}
        >
            <div className={`flex flex-col w-full items-end`}>
                {notifications.map((notification, idx) => (
                    <Notification
                        key={`${notification.message}${notification.txId}${idx}`}
                        type={notification.type}
                        message={notification.message}
                        description={notification.description}
                        txId={notification.txId}
                        timeout={notification.timeout}
                        network={clusterConfig?.networkType}
                        onHide={() => dispatch(removeNotification(notification))}
                    />
                ))}
            </div>
        </div>
    );
}

const Notification = ({ type, message, description, txId, timeout, network, onHide }: {
    type: NotificationType,
    message: string,
    description: string,
    txId: string,
    timeout: number,
    network: EndPoint,
    onHide: () => {}
}) => {
    useEffect(() => {
        const id = setTimeout(() => {
            onHide()
        }, timeout * 1000);

        return () => {
            clearInterval(id);
        };
    }, [onHide, timeout]);

    return (
        <div
            className={`max-w-sm w-full bg-white-light shadow-lg rounded-3xl mt-2 pointer-events-auto ring-1 ring-black ring-opacity-5 p-2 m-4 overflow-hidden`}
        >
            <div className={`p-4`}>
                <div className={`flex items-center`}>
                    <div className={`flex-shrink-0`}>
                        {type == 'success' ? (
                            <WrappedImage src={ICON_CHECKMARK} height={32} width={32} alt={""}/>
                        ) : null}
                        {type === 'info' && <WrappedImage src={ICON_INFO} height={32} width={32} alt={""}/>}
                        {type === 'error' && <WrappedImage src={ICON_EXCLAMATION} height={32} width={32} alt={""}/>}
                    </div>
                    <div className={`ml-2 w-0 flex-1`}>
                        <div className={`font-bold text-fgd-1`}>{message}</div>
                        {description ? (
                            <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
                        ) : null}
                        {txId ? (
                            <div className="flex flex-row">
                                <a
                                    href={'https://explorer.solana.com/tx/' + txId + `?cluster=` + network}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row underline text-green"
                                >
                                    <svg className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                    <div className="flex mx-4">
                                        {txId.slice(0, 8)}...
                                        {txId.slice(txId.length - 8)}
                                    </div>
                                </a>
                            </div>
                        ) : null}
                    </div>
                    <div className={`ml-4 flex-shrink-0 self-start flex`}>
                        <button
                            onClick={() => onHide()}
                            className={`bg-bkg-2 default-transition rounded-md inline-flex text-fgd-3 hover:text-fgd-4 focus:outline-none`}
                        >
                            <span className={`sr-only`}>Close</span>
                            <WrappedImage src={ICON_CANCEL} height={20} width={20} alt={""}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationList
