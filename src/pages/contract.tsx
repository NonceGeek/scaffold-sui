import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { SUI_PACKAGE, SUI_MODULE, NETWORK } from "../config/constants";
import { JsonRpcProvider, TransactionBlock } from '@mysten/sui.js';
import TransacitonLink from "../utils/tools";

type SwordListPros = { swords: Array<{ id: string, magic: number, strength: number }>, transfer: Function };
const SwordList = ({ swords, transfer }: SwordListPros) => {
    return swords && (
        <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
            <div className="card-body">
                <h2 className="card-title">swords list:</h2>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Magic</th>
                                <th>Strength</th>
                                <th>Operate</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                swords.map((item, i) =>
                                    <tr key={item.id}>
                                        <th>{item.id}</th>
                                        <td>{item.magic}</td>
                                        <td>{item.strength} </td>
                                        <td>
                                            <a className="link link-hover link-primary" onClick={() => { transfer(item.id) }}>Transfer</a>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function Contract() {
    const [swords, setSwords] = useState<Array<any>>([]);
    const [transaction, setTransaction] = useState('');
    const { connected, account, signAndExecuteTransactionBlock } = useWallet();
    const [displayModal, toggleDisplay] = useState(false);
    const [message, setMessage] = useState('');
    const [sword_id, updateSwordId] = useState('')
    const [to_recipient, updateToRecipient] = useState("");
    const [formInput, updateFormInput] = useState<{
        magic: string;
        strength: string;
        recipient: string;
    }>({
        magic: "",
        strength: "",
        recipient: "",
    });

    async function transferSword(id: string) {
        console.log("transfer sword ", id);
        updateSwordId(id);
        toggleDisplay(true);
    }

    async function doTransfer() {
        function makeTranscaction() {
            return {
                packageObjectId: SUI_PACKAGE,
                module: SUI_MODULE,
                function: 'sword_transfer',
                typeArguments: [],
                // 类型错误，传递字符串类型，部分钱包会内部转化
                arguments: [
                    sword_id,
                    to_recipient,
                ],
                gasBudget: 30000,
            };
        }

        setMessage("");
        try {
            const tx = new TransactionBlock();
            tx.moveCall({
                target: SUI_PACKAGE + "::my_module::sword_transfer" as any,
                arguments: [
                    tx.pure(sword_id),
                    tx.pure(to_recipient),
                ]
            })

            const resData = await signAndExecuteTransactionBlock({
                transactionBlock: tx,
            });

            updateFormInput({ magic: "", strength: "", recipient: "" })
            console.log('success', resData);
            setMessage('Added succeeded');
            if (resData && resData.digest && resData.digest) {
                setTransaction(TransacitonLink(resData.digest, "my_module"));
            }
        } catch (e) {
            console.error('failed', e);
            setMessage('Mint failed: ' + e);
            setTransaction('');
        }
    }


    async function fetch_sword() {
        if (account?.address == null) {
            return;
        }
        const swordType = SUI_PACKAGE + "::my_module::Sword";
        const objects = await provider.getOwnedObjects({
            owner: account?.address,
            filter: {
                StructType: swordType
            }, options: {
                showType: true,
                showContent: true,
                showDisplay: true,
            }
        })
        console.log(objects);

        let swords = objects.data.map(item => {
            console.log("old item : ", item);
            if (item.data && item.data.content) {
                console.log("old data content ", item.data.content);
                let content = item.data.content as any;
                let { magic, strength } = content.fields as any;
                return {
                    id: item.data?.objectId,
                    magic, strength
                }
            }
        })
        console.log("swords list : ", swords);
        setSwords(swords)
    }


    useEffect(() => {
        (async () => {
            if (connected) {
                fetch_sword()
            }
        })()
    }, [connected, transaction])

    const provider = new JsonRpcProvider();

    const createSword = async () => {
        try {
            const tx = new TransactionBlock();
            const { magic, strength, recipient } = formInput;
            tx.moveCall({
                target: SUI_PACKAGE + "::my_module::sword_create" as any,
                arguments: [
                    tx.pure(magic),
                    tx.pure(strength),
                    tx.pure(recipient)
                ]
            })

            const resData = await signAndExecuteTransactionBlock({
                transactionBlock: tx,
            });

            updateFormInput({ magic: "", strength: "", recipient: "" })
            console.log('success', resData);
            setMessage('Added succeeded');
            if (resData && resData.digest && resData.digest) {
                setTransaction(TransacitonLink(resData.digest, "my_module"));
            }

        } catch (e) {
            console.error('failed', e);
            setTransaction('');
        }
    }

    return (
        <div>

            <div className={displayModal ? "modal modal-bottom sm:modal-middle modal-open" : "modal modal-bottom sm:modal-middle"}>
                <div className="modal-box">
                    <label onClick={() => { toggleDisplay(false) }} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <h3 className="font-bold text-lg">Input recent address</h3>
                    <input
                        placeholder="Recipient"
                        className="mt-8 p-4 input input-bordered input-primary w-full"
                        value={to_recipient}
                        onChange={(e) =>
                            updateToRecipient(e.target.value)
                        }
                    />
                    <div className="modal-action">
                        <label htmlFor="my-modal-6" className="btn" onClick={() => {
                            toggleDisplay(!displayModal);
                            doTransfer();
                        }}>Done!</label>
                    </div>
                </div>
            </div>

            <div className="alert alert-info shadow-lg">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>
                        Sui Test Package Module: <a className="link link-primary" target={"_blank"} href={"https://explorer.sui.io/object/" + SUI_PACKAGE + "?network=" + NETWORK}>{SUI_PACKAGE}</a>
                    </span>
                </div>
            </div>

            <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
                <div className="card-body">
                    <h2 className="card-title">create a sword</h2>
                    <input
                        placeholder="Magic value"
                        className="mt-8 p-4 input input-bordered input-primary w-full"
                        value={formInput.magic}
                        onChange={(e) =>
                            updateFormInput({ ...formInput, magic: e.target.value })
                        }
                    />
                    <input
                        placeholder="Strength value"
                        className="mt-8 p-4 input input-bordered input-primary w-full"
                        value={formInput.strength}
                        onChange={(e) =>
                            updateFormInput({ ...formInput, strength: e.target.value })
                        }
                    />
                    <input
                        placeholder="Recipient"
                        className="mt-8 p-4 input input-bordered input-primary w-full"
                        value={formInput.recipient}
                        onChange={(e) =>
                            updateFormInput({ ...formInput, recipient: e.target.value })
                        }
                    />
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary" onClick={createSword}>Create Sword</button>
                        {transaction == "" ? "" : <a target={"_blank"} className="btn btn-info" href={transaction}>{transaction}</a>}
                    </div>
                </div>
            </div>

            <SwordList swords={swords} transfer={transferSword} />

        </div>
    );
}