//@ts-expect-error "hyperdht" is untyped :(
import untyped_DHT from "hyperdht";
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

type NodeOptions = {
  /**
   * Is autoconfigured and should not be used.
   * Override only for tests.
   **/
  ephemeral?: boolean;
  firewalled?: boolean;
  bootstrap?: Array<{ host: string; port: number }>;
  port?: number;
};
interface DHT_Typed {
  new (options?: NodeOptions): Node;
  keyPair(seed?: Buffer): KeyPair;
}

interface CreateServerProps {
  firewall: (remotePublicKey: Buffer, remoteHandshakePayload: any) => boolean;
}

interface ConnectProps {
  keyPair?: KeyPair;
}
export interface Node {
  connect: (remoteKey: Buffer, props?: ConnectProps) => Socket;
  createServer(props: CreateServerProps): Server;
  ready(): Promise<void>;
  address(): {
    /** external IP of the server */
    host: string;
    /** external port of the server if predictable */
    port: number;
    /** public key of the server */
    publicKey: Buffer;
  };
  destroy(): Promise<void>;
}
