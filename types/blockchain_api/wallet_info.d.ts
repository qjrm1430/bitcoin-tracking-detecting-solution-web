/*   지갑 정보 가져오는 API에서 사용되는 타입   */

declare namespace WalletInfo {
  interface Txs {
    txid: string;
    value: number;
    fee: number;
    time: number;
    is_rcv: boolean;
  }

  interface Cluster {
    _id: string;
    name?: string;
    n_addr: number;
  }
}

export default WalletInfo;
