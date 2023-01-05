//@ts-expect-error "@hyperswarm/dht" is untyped :(
import untyped_DHT from "@hyperswarm/dht";
import type { Socket } from "net";
import { Duplex } from "stream";

interface CreateServerProps {
  firewall: (remotePublicKey: string, remoteHandshakePayload: any) => boolean;
}
export interface Server {
  listen: (key: KeyPair) => void;
  on: (type: "connection", cb: (noiseSocket: Duplex) => void) => void;
}
// (noiseSocket: Duplex)=>void
interface Node {
  connect: (remoteKey: Buffer) => Socket;
  createServer(props: CreateServerProps): Server;
}
export interface KeyPair {
  publicKey: Buffer;
  secretKey: Buffer;
}

interface DHT_Typed {
  new (): Node;
  keyPair(seed?: Buffer): KeyPair;
}

export const DHT = untyped_DHT as DHT_Typed;
