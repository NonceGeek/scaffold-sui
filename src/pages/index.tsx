import { useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { JsonRpcProvider, TransactionBlock } from '@mysten/sui.js';
import { SUI_PACKAGE, SUI_MODULE, NETWORK } from "../config/constants";

import { Signer } from "../components/Signer";

type NftListPros = { nfts: Array<{ url: string, id: string, name: string, description: string }> };
const NftList = ({ nfts }: NftListPros) => {
  return nfts && (
    <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
      <div className="card-body">
        <h2 className="card-title">Minted NFTs:</h2>
        {
          nfts.map((item, i) => <div className="gallery" key={item.id}>
            <a target="_blank" href={"https://explorer.sui.io/object/" + item.id + "?network=" + process.env.NEXT_PUBLIC_SUI_NETWORK}>
              <img src={item.url} max-width="300" max-height="200"></img>
              <div className="name">{item.name}</div>
              <div className="desc">{item.description}</div>
            </a>
          </div>)
        }
      </div>
    </div>
  )
}

export default function Home() {
  const provider = new JsonRpcProvider();
  const { account, connected, signAndExecuteTransactionBlock } = useWallet();
  const [formInput, updateFormInput] = useState<{
    name: string;
    url: string;
    description: string;
  }>({
    name: "",
    url: "",
    description: "",
  });
  const [message, setMessage] = useState('');
  const [transaction, setTransaction] = useState('');
  const [nfts, setNfts] = useState<Array<{ id: string, name: string, url: string, description: string }>>([]);
  const [recipient, updateRecipient] = useState("");

  async function mint_example_nft() {
    setMessage("");
    const { name, url, description } = formInput;
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: SUI_PACKAGE + "::devnet_nft::mint" as any,
        arguments: [
          tx.pure(name),
          tx.pure(description),
          tx.pure(url),
        ]
      })

      const resData = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      updateFormInput({ name: "", url: "", description: "" })
      console.log('success', resData);
      setMessage('Added succeeded');
      if (resData && resData.digest && resData.digest) {
        setTransaction('https://explorer.sui.io/transaction/' + resData.digest + "?network=" + NETWORK);
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTransaction('');
    }
  }

  async function fetch_example_nft() {
    const nftItemType = SUI_PACKAGE + "::devnet_nft::DevNetNFT";
    if (account != null) {
      const objects = await provider.getOwnedObjects({
        owner: account?.address, filter: {
          StructType: nftItemType
        }, options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        }
      })
      if (objects.data.length > 0) {
        const nfts = objects.data.map((item: any) => {
          console.log(item);
          const { name, url, description } = item.data.content.fields as any;
          return {
            id: item.data.objectId,
            name,
            url,
            description
          }
        })
        setNfts(nfts)
      }

    }

  }

  useEffect(() => {
    (async () => {
      if (connected) {
        fetch_example_nft()
      }
    })()
  }, [connected, transaction])

  return (
    <div>

      <Signer />

      <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
        <div className="card-body">
          <h2 className="card-title">Mint Example NFT:</h2>
          <input
            placeholder="NFT Name"
            className="mt-4 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <input
            placeholder="NFT Description"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder="NFT IMAGE URL"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, url: e.target.value })
            }
          />
          <p className="mt-4">{message}{message && <Link href={transaction}>, View transaction</Link>}</p>
          <div className="card-actions justify-end">
            <button
              onClick={mint_example_nft}
              className={
                "btn btn-primary btn-xl"
              }>
              Mint example NFT
            </button>
          </div>
        </div>
      </div>

      <NftList nfts={nfts} />
    </div >
  );
}
