import { DependencyList, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TokenInfo } from "../models/types";
import { selectTokenInfos } from "../stores/reducers/externalDataReducer";
import { selectUserAccounts } from "../stores/reducers/userDataReducer";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/store";
import { WindowContext } from "../provider/WindowContextProvider";

const EMPTY_TOKEN_INFO: TokenInfo = {
    name: "",
    symbol: "",
    tokenIcon: null,
    mint: "",
    extraInfo: "",
    decimals: 0
}

export function useTokenNames(...tokens: TokenInfo[]) {
    return useMemo(() => {
        const tokenData = [];
        tokens.map((token) => tokenData.push(token.name, token.symbol));
        return tokenData;
    }, [tokens]);
}

export function useAsyncValue<T>(func: () => Promise<T>, deps: any[], initialValue: T = null): T {
    const [state, setState] = useState<T>(initialValue);
    const funcRef = useRef(null);
    funcRef.current = func;
    useEffect(() => {
        (async () => {
            const data = await funcRef.current();
            setState(data);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [funcRef, ...deps]);
    return state;
}

export function useDebounce(func: () => void, delay: number, deps: DependencyList) {
    const funcRef = useRef(null);
    funcRef.current = func;

    useEffect(
        () => {
            // Call function after delay
            const handler = setTimeout(() => {
                funcRef.current();
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [delay, funcRef, ...deps]
    );
}

export function useRefresh(
    func: () => void,
    canRefresh: boolean,
    refreshIntervalMs: number,
    disableInstantRefresh: boolean = false,
    instantRefreshIntervalNs: number = refreshIntervalMs
){
    const funcRef = useRef(null);
    const lastRefresh = useRef(disableInstantRefresh ? Date.now() : 0);
    funcRef.current = func;

    const visible = useContext(WindowContext);

    useEffect(() => {
        if (!canRefresh || !visible.windowIsActive){
            return;
        }

        // Refresh instantly if they have been away or something
        if ((Date.now() - lastRefresh.current) > instantRefreshIntervalNs){
            funcRef.current();
            lastRefresh.current = Date.now();
        }
        
        const interval = setInterval(async () => {
            funcRef.current();
            lastRefresh.current = Date.now();
        }, refreshIntervalMs);

        return () => clearInterval(interval);
    }, [visible, refreshIntervalMs, canRefresh, instantRefreshIntervalNs]);
}

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useTokenInfo(mint: string){
    const tokenInfos = useAppSelector(selectTokenInfos);
    if (!mint){
        return EMPTY_TOKEN_INFO;
    }
    return tokenInfos[mint] ?? EMPTY_TOKEN_INFO;
}

export function useTokenAccount(mint: string){
    const balanceMap = useAppSelector(selectUserAccounts);
    if (!balanceMap){
        return null;
    }
    return balanceMap[mint]?.account ?? null;
}

export function useBalance(mint: string){
    const balanceMap = useAppSelector(selectUserAccounts);
    if (!balanceMap){
        return 0;
    }
    return balanceMap[mint]?.balance ?? 0;
}