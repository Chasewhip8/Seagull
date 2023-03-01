import { Notification } from "../models/types";
import { AppDispatch } from "../stores/store";
import { addNotification } from "../stores/reducers/notificationReducer";

export function notify(newNotification: Notification, dispatch: AppDispatch) {
    if (!newNotification.timeout) {
        newNotification.timeout = 15;
    }
    dispatch(addNotification(newNotification));
}
