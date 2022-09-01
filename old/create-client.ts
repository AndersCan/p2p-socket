/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import DHT from "@hyperswarm/dht";
import assert from "node:assert";

interface Props {
  remotePublicKey: string;
}
export function createClient(props: Props) {
  console.log(props.remotePublicKey.length);
  // assert(props.remotePublicKey.length === 32);
  const node = new DHT();
  // create a server to listen for secure connections
  const socket = node.connect(Buffer.from(props.remotePublicKey, "hex"));

  return socket;
}
