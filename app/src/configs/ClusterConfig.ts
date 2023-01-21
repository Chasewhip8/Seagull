import DEVNET from "./clusters/devnet";
import MAINNET from "./clusters/mainnet";

export const DEFAULT_CLUSTER = getDefaultCluster();

function getDefaultCluster(){
    const env = process.env.NODE_ENV;
    if (env && env == "development"){
        return DEVNET;
    }
    return MAINNET;
}

export const CLUSTERS = [MAINNET];

export function getClusterByName(name: string){
    return CLUSTERS.find(cluster => cluster.clusterName == name);
}