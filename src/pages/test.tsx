import { useWallet } from "@suiet/wallet-kit";
import {  JsonRpcProvider, TransactionBlock, devnetConnection } from '@mysten/sui.js';
import { useEffect, useState } from "react";

const Test = ()=>{
    const { address,signAndExecuteTransactionBlock} = useWallet();
    const [result,updateResult] = useState({});
    const provider = new JsonRpcProvider(devnetConnection);


    useEffect(()=>{
        if(address){
            (async()=>{
                const coins = await provider.getOwnedObjects({
                    owner:address
                })
                console.log(coins);
            })();
        }
    },[address])
    


    const testHandle = async()=>{
        const tx = new TransactionBlock();
        const coins = tx.splitCoins(tx.gas,[tx.pure(1)]);
        tx.transferObjects([coins[0]], tx.pure(address));
        const result = await  signAndExecuteTransactionBlock({
            transactionBlock:tx
        });
        updateResult(result);
    }

    return (
        <>
            <div>

                <p>{address}</p>
                <div className="mt-3 mb-3">
                    <button onClick={testHandle} className="btn btn-primary">Click for test!!!</button>
                </div>
                <pre>
                    {JSON.stringify(result)}
                </pre>
                
            </div>
        </>
    )
}

export default Test;