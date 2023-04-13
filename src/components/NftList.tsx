type NftListPros = { nfts: Array<{ url: string, id: string, name: string, description: string }> };
export function NftList({ nfts }: NftListPros) {
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