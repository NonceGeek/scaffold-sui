
import { NETWORK } from "../config/constants";

export default function TransacitonLink(digest: string, module: string) {
    return `https://explorer.sui.io/txblock/${digest}?module=${module}&network=${NETWORK}`
}
