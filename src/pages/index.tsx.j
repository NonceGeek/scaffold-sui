import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import React from "react";
import Link from 'next/link';
import { JsonRpcProvider } from '@mysten/sui.js';

const BaseAddr = "0x2";

type NftListPros = { nfts: Array<{ url: string, id: string, name: string, description: string }> };
const NftList = ({ nfts }: NftListPros) => {
  return (
    <div>
      {
        nfts.length != 0 ? (
          <p className="mt-4"><b>Minted NFTs:</b></p>
        ) : <></>
      }
      {nfts && nfts.map((item, i) => <div className="gallery" key={item.id}>
        <a target="_blank" href={"https://explorer.sui.io/object/" + item.id + "?network=" + process.env.NEXT_PUBLIC_SUI_NETWORK}>
          <img src={item.url} max-width="300" max-height="200"></img>
          <div className="name">{item.name}</div>
          <div className="desc">{item.description}</div>
        </a>
      </div>)}
    </div>
  )
}

export default function Home() {
  const provider = new JsonRpcProvider();
  const { account, connected, signAndExecuteTransaction } = useWallet();
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
  const [tx, setTx] = useState('');
  const [nfts, setNfts] = useState<Array<{ id: string, name: string, url: string, description: string }>>([]);
  const [gasObjects, setGasObjects] = useState<Array<{ id: string, value: Number, }>>([]);

  async function mint_example_nft() {
    setMessage("");
    try {
      const data = create_example_nft()
      const resData = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data,
        },
      });
      console.log('success', resData);
      setMessage('Mint succeeded');
      setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  function create_example_nft() {
    const { name, url, description } = formInput;
    return {
      packageObjectId: BaseAddr,
      module: 'devnet_nft',
      function: 'mint',
      typeArguments: [],
      arguments: [
        name,
        description,
        url,
      ],
      gasBudget: 30000,
    };
  }

  async function fetch_gas_coins() {
    const gasObjects = await provider.getGasObjectsOwnedByAddress(account!.address)
    const gas_ids = gasObjects.map(item => item.objectId)
    const gasObjectDetail = await provider.getObjectBatch(gas_ids)
    console.log(gasObjectDetail);


    const gasList = gasObjectDetail.map((item) => {
      return {
        id: item.details.data.fields.id.id,
        value: item.details.data.fields.balance,
      }
    });
    setGasObjects(gasList);
  }

  async function fetch_example_nft() {
    const objects = await provider.getObjectsOwnedByAddress(account!.address)
    const nft_ids = objects
      .filter(item => item.type === BaseAddr + "::devnet_nft::DevNetNFT")
      .map(item => item.objectId)
    const nftObjects = await provider.getObjectBatch(nft_ids)

    const nfts = nftObjects.filter(item => item.status === "Exists").map(item => {
      console.log("nft item : ", item);
      return {
        id: item.details.data.fields.id.id,
        name: item.details.data.fields.name,
        url: item.details.data.fields.url,
        description: item.details.data.fields.description,
      }
    })
    setNfts(nfts)
  }

  useEffect(() => {
    (async () => {
      if (connected) {
        fetch_example_nft()
      }
    })()
  }, [connected, tx])

  useEffect(() => {
    (async () => {
      if (connected) {
        fetch_gas_coins()
      }
    })()
  }, [connected])

  return (
    <div>
      <div>
        <p><b>Mint Example NFT</b></p>
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
        <button
          onClick={mint_example_nft}
          className={
            "btn btn-primary font-bold mt-4 text-white rounded p-4 shadow-lg"
          }>
          Mint example NFT
        </button>
        <p className="mt-4">{message}{message && <Link href={tx}>, View transaction</Link>}</p>
      </div>
      <NftList nfts={nfts} />


    </div>
  );
}
