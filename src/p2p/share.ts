/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import { DHT } from "./dht";
import { connect } from "net";
import { createKeyPair } from "../create-key-pair";
import { socketPipe } from "../proxy/socket-pipe";
import { Duplex } from "stream";
import kleur from "kleur";
import { getLogger } from "../logger";
interface Props {
  tcp: {
    host: string;
    port: number;
  };
  keyPair: {
    secretKey: Buffer;
    publicKey: Buffer;
  };
  bootstrap?: Array<{ host: string; port: number }>;
}
/**
 * Share a p2p-socket
 */
export async function share(props: Props) {
  const node = new DHT({ bootstrap: props.bootstrap });

  const { host, port } = props.tcp;
  const seed = `${host}:${port}:${props.keyPair.secretKey.toString("hex")}`;

  const hostAndKeyPair = createKeyPair(seed);

  // create a server to listen for secure connections
  const p2pServer = node.createServer({
    firewall(_remotePublicKey: Buffer, _remoteHandshakePayload: any) {
      // validate if you want a connection from remotePublicKey
      // if you do return false, else return true
      // remoteHandshakePayload contains their ip and some more info
      getLogger().info(kleur.bgGreen(`A peer has connected`));
      return false;
    },
  });

  // noiseSocket is a `https://github.com/holepunchto/hyperswarm-secret-stream`
  p2pServer.on("connection", function (noiseSocket: Duplex) {
    getLogger().info(`new connection`);
    const host = props.tcp.host;
    const port = props.tcp.port;

    const id = `${Math.random()}`.slice(2);

    const requestSocket = connect({
      port,
      host,
    });

    socketPipe(noiseSocket, requestSocket, id);
  });

  await p2pServer.listen(hostAndKeyPair);

  const { host: remoteHost, port: remotePort } = p2pServer.address();
  getLogger().info("server.address()", { remoteHost, remotePort });

  const unshare = () => {
    p2pServer.close();
    node.destroy();
  };

  /**
   * hostAndKeyPair: keyPair derived from host and port
   */
  return { p2pServer, hostAndKeyPair, unshare };
}
