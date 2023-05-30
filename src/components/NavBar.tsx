import Image from "next/image";
import { NavItem } from "./NavItem";
import { SuiConnect } from "./SuiConnect";
import {
  MODULE_URL
} from "../config/constants";

export function NavBar() {
  return (
    <nav className="navbar py-4 px-4 bg-base-100">
      <div className="flex-1">
        <a href="http://movedid.build" target="_blank" rel="noreferrer">
          <Image src="/logo.png" width={64} height={64} alt="logo" />
        </a>
        <ul className="menu menu-horizontal p-0 ml-5">
          <NavItem href="/" title="Nft Sample" />
          <NavItem href="/contract" title="Sample Contract" />
          <NavItem href="/publish" title="Publish Module" />
          <NavItem href="/split-transfer" title="Split Coin & Transfer" />
          <NavItem href="/rpclist" title="Rpc Node" />
          {/* <NavItem href="/" title="AddrManager" />
          <NavItem href="/endpoint" title="ServiceManager" /> */}
          {/* <NavItem href="/did_querier" title="DIDQuerier" /> */}
          <li className="font-sans font-semibold text-lg">
            {/* <a href="https://github.com/NonceGeek/MoveDID/tree/main/did-aptos" target="_blank">Source Code</a> */}
            <a href={MODULE_URL} target="_blank" rel="noreferrer">Contract on Explorer</a>
          </li>
        </ul>
      </div>
      <SuiConnect />
    </nav>
  );
}
