export function toFixRelative(x: number, precision: number = 4): string {
    if (typeof x !== "number") {
        return;
    }

    if (x === 0) {
        return "0";
    }

    const log10 = Math.log10(x);
    let n = Math.max(-log10 + precision, 2);
    return x.toFixed(n);
}

export function extractElementFromArray<T>(dataList: T[], selectedItem: T): {
    selectedItem: T,
    dataList: T[]
} {
    const newList = dataList ? dataList : [];

    if (selectedItem) {
        const index = newList.indexOf(selectedItem, 0);

        if (index > -1) {
            let sortedContractList = [...dataList];
            sortedContractList.splice(index, 1);
            return {
                selectedItem,
                dataList: sortedContractList
            };
        }
    }

    return {
        selectedItem: null,
        dataList: newList
    }
}

export function truncate(value: number, decimals: number): number {
    return Number(value.toFixed(decimals+1).slice(0,-1));
}

export function convertTimestampToHumanReadable(date: Date): string {
    return date.toLocaleDateString('en-us', {year: 'numeric', month: 'long', day: 'numeric'});
}