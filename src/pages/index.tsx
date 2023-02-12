import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { SUI_PACKAGE, SUI_MODULE } from "../config/constants";
export default function Contract() {

    const [magic, updateMagic] = useState('');
    const [strength, updateStrength] = useState('');
    const { signAndExecuteTransaction } = useWallet();
    const [recipient, updateRecipient] = useState("");
    const [tx, setTx] = useState('')

    function makeTranscaction() {
        return {
            packageObjectId: SUI_PACKAGE,
            module: SUI_MODULE,
            function: 'sword_create',
            typeArguments: [],
            // 类型错误，传递字符串类型，部分钱包会内部转化
            arguments: [
                magic,
                strength,
                recipient,
            ],
            gasBudget: 30000,
        };
    }

    const createSword = async () => {
        try {
            const data = makeTranscaction();
            const resData = await signAndExecuteTransaction({
                transaction: {
                    kind: 'moveCall',
                    data
                }
            });
            console.log('success', resData);
            setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
        } catch (e) {
            console.error('failed', e);
            setTx('');
        }
    }

    return (
        <>
            <div className="m-7 p-4  w-full mt-4 rounded-md border-2">
                <p>Package Module : {SUI_PACKAGE}</p>
                {tx == "" ? (<></>) : (
                    <a target="_blank" href={tx}>{tx}</a>
                )}
            </div>
            <div className="m-7 p-4  w-full mt-4 rounded-md border-2">
                <input
                    placeholder="Magic value"
                    className="mt-8 p-4 input input-bordered input-primary w-full"
                    onChange={(e) => {
                        updateMagic(e.target.value)
                    }}
                />
                <input
                    placeholder="Strength value"
                    className="mt-8 p-4 input input-bordered input-primary w-full"
                    onChange={(e) =>
                        updateStrength(e.target.value)
                    }
                />
                <input
                    placeholder="Recipient"
                    className="mt-8 p-4 input input-bordered input-primary w-full"
                    value={recipient}
                    onChange={(e) =>
                        updateRecipient(e.target.value)
                    }
                />
                <button
                    onClick={createSword}
                    className={
                        "btn btn-primary font-bold mt-4 text-white rounded p-4 shadow-lg"
                    }>
                    Create Sword
                </button>
            </div>
            <div className="m-7 p-4  w-full mt-4 rounded-md border-2">
                <p>Transfer Sword</p>
            </div>
        </>
    );
}