export function makeTxParam(data: any) {
  let flags: string[] = [];
  let entities: string[] = [];
  let comments: string = "N/A";
  const inputValue = data.inputs.map((input: any) => {
    return `${input.txid}:${input.prev_out.addr}:${input.prev_out.value}`;
  });
  const outputValue = data.outputs.map((output: any) => {
    let result = `${output.addr}:${output.value}:${output.spent}`;
    if (output.spent)
      result += `:${output.spending_outpoints.txid}$${output.spending_outpoints.time}`;
    return result;
  });

  if (Object.keys(data.profile).length != 0) {
    if (data.profile.flags) {
      flags = data.profile.flags.map((flag: any) => {
        return `${flag.id}:${flag.name}`;
      });
    }
    if (data.profile.entities) {
      entities = data.profile.entities;
    }
    if (data.profile.comments) {
      comments = data.profile.comments;
    }
  }

  return {
    hash: data.txid,
    n_input: data.n_input,
    n_output: data.n_output,
    input_value: data.input_value,
    output_value: data.output_value,
    fee: data.fee,
    block_hash: data.block_hash,
    block_height: data.block_height,
    size: data.size,
    time: data.time,
    ver: data.ver,
    lock_time: data.lock_time,
    inputs: inputValue,
    outputs: outputValue,
    flags,
    entities,
    comments,
    true_recipient: data.true_recipient,
    is_CoinJoin: data.is_CoinJoin,
  };
}

export function makeWalletParam(data: any) {
  let clusterValue: string = "N/A";
  let flags: string[] = [];
  let entities: string[] = [];
  let comments: string = "N/A";
  if (Object.keys(data.cluster).length != 0) {
    clusterValue = `${data.cluster.id}:${data.cluster.name}:${data.cluster.n_addr}`;
  }
  if (Object.keys(data.profile).length != 0) {
    if (data.profile.flags) {
      flags = data.profile.flags.map((flag: any) => {
        return `${flag.id}:${flag.name}`;
      });
    }
    if (data.profile.entities) {
      entities = data.profile.entities;
    }
    if (data.profile.comments) {
      comments = data.profile.comments;
    }
  }

  return {
    hash: data.addr,
    final_balance: data.final_balance,
    n_tx: data.n_tx,
    n_rcv_tx: data.n_rcv_tx,
    n_sent_tx: data.n_sent_tx,
    total_received: data.total_received,
    total_sent: data.total_sent,
    first_seen_receiving: data.first_seen_receiving,
    last_seen_receiving: data.last_seen_receiving,
    first_seen_sending: data.first_seen_sending,
    last_seen_sending: data.last_seen_sending,
    format: data.format,
    cluster: clusterValue,
    flags,
    entities,
    comments,
  };
}
