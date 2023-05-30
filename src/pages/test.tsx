import { useWallet } from "@suiet/wallet-kit";
import {  TransactionBlock } from '@mysten/sui.js';

const Test = ()=>{
    const { address} = useWallet();
    const testHandle = async()=>{
        console.log(address);
        console.log("=====....");
        const tx = new TransactionBlock();
        console.log("=====");
        const [coins] = tx.splitCoins(tx.gas,[tx.pure(10000)]);
        console.log("=====.####...");
        tx.transferObjects([coins], tx.pure(address));
        console.log("=====.###OOOO#...");
    }

    return (
        <>
            <div>

                <div className="mt-3 mb-3">
                    <button onClick={testHandle} className="btn btn-primary">Click for test!!!</button>
                </div>
                
            </div>
        </>
    )
}

export default Test;