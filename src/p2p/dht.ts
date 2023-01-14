//@ts-expect-error "@hyperswarm/dht" is untyped :(
import untyped_DHT from "@hyperswarm/dht";
import type { Socket } from "net";
import { Duplex } from "stream";

export interface Server {
  listen: (key: KeyPair) => void;
  on: (type: "connection", cb: (noiseSocket: Duplex) => void) => void;
  close(): void;
}

export interface KeyPair {
  publicKey: Buffer;
  secretKey: Buffer;
}

export const DHT = untyped_DHT as DHT_Typed;
interface DHT_Typed {
  new (): Node;
  keyPair(seed?: Buffer): KeyPair;
}

interface CreateServerProps {
  firewall: (remotePublicKey: string, remoteHandshakePayload: any) => boolean;
}

interface Node {
  connect: (remoteKey: Buffer) => Socket;
  createServer(props: CreateServerProps): Server;
  destroy(): void;
}
