import WalletInfo from "./wallet_info";

/*   Bitcoin 정보 가져오는 API에서 사용되는 타입   */
declare namespace BlockchainApi {
  interface Wallet {
    addr: string;
    balance: number;
    n_tx: number;
    n_rcv_tx: number;
    n_sent_tx: number;
    total_received: number;
    total_sent: number;
    first_seen_receiving: number;
    last_seen_receiving: number;
    first_seen_sending: number;
    last_seen_sending: number;
    txs: WalletInfo.Txs[];
    cluster?: WalletInfo.Cluster;
    profile?: Profile;
  }

  interface TxHash {
    txid: string;
    n_input: number;
    n_output: number;
    input_value: number;
    output_value: number;
    fee: number;
    block_hash: string;
    block_height: number;
    size: number;
    time: number;
    ver: number;
    lock_time: number;
    inputs: Inputs[] | CoinBase[];
    outputs: {
      addr: string;
      value: number;
      n: number;
      spent: boolean;
      spending_outpoints?: {
        txid: string;
        n: number;
      };
    }[];
    profile?: Profile;
  }

  interface Inputs {
    sequence: number;
    txid: string;
    n: number;
    prev_out: {
      addr: string;
      value: number;
    };
  }
  interface CoinBase {
    coinbase: string;
    sequence: number;
  }
  interface Cluster {
    _id: string;
    name: string;
    n_wallet: number;
    date_created: number;
    constructor: string;
    date_last_modified: number;
    last_modifier: string;
    wallet?: {
      addr: string;
      balance: number;
    }[];
    profile?: Profile;
  }

  interface Profile {
    flags?: { _id: string; name: string }[];
    entities?: string[];
    comment?: string;
  }
}
export default BlockchainApi;
