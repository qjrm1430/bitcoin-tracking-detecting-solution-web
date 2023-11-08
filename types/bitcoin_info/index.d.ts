/*   Bitcoin 정보 가져오는 API에서 사용되는 타입   */
declare namespace BitcoinInfo {
  interface Transaction {
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
    inputs: (Inputs | never)[];
    outputs: Outputs[];
    profile: Profile | Record<string, never>;
    true_recipient: string[];
    is_CoinJoin: boolean;
  }
  interface Txs {
    n_tx: number;
    txs: {
      fee: number;
      txid: string;
      timestamp: number;
      value: number;
      index: number;
    }[];
  }

  interface Inputs {
    txid: string;
    n: number;
    prev_out: {
      addr: string;
      value: number;
    };
  }

  interface Outputs {
    addr: string;
    value: number;
    spent: boolean;
    n: number;
    spending_outpoints:
      | {
          txid: string;
          n: number;
        }
      | Record<string, never>;
  }

  interface Wallet {
    addr: string;
    final_balance: number;
    n_tx: number;
    n_rcv_tx: number;
    n_sent_tx: number;
    total_received: number;
    total_sent: number;
    first_seen_receiving: number;
    last_seen_receiving: number;
    first_seen_sending: number;
    last_seen_sending: number;
    format: string;
    cluster?: WalletInfo.Cluster;
    profile?: Profile;
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
    flags: (
      | {
          _id: string;
          name: string;
        }
      | never
    )[];
    entities: string[];
    comments: string | null;
  }
}
export default BitcoinInfo;
