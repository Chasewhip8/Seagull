import DEVNET from "./clusters/devnet";

export const DEFAULT_CLUSTER = getDefaultCluster();

function getDefaultCluster(){
    return DEVNET;
    // const env = process.env.NODE_ENV;
    // if (env && env == "development"){
    //     return DEVNET;
    // }
    // return MAINNET;
}

export const CLUSTERS = [DEVNET];

export function getClusterByName(name: string){
    return CLUSTERS.find(cluster => cluster.clusterName == name);
}