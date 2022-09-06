/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import DHT from "@hyperswarm/dht";
import { connect } from "net";
import { createKeyPair } from "./create-key-pair";
import { pipeline } from "stream";
import kleur from "kleur";
import { getLogger } from "./logger";
interface Props {
  tcp: {
    host: string;
    port: number;
  };
  keyPair: {
    secretKey: Buffer;
    publicKey: Buffer;
  };
}
export async function createP2PtoTCPProxy(props: Props) {
  const node = new DHT();

  const { host, port } = props.tcp;
  const seed = `${host}:${port}:${props.keyPair.secretKey.toString("hex")}`;

  const hostAndKeyPair = createKeyPair(seed);

  // create a server to listen for secure connections
  const p2pServer = node.createServer({
    firewall(remotePublicKey, remoteHandshakePayload) {
      // validate if you want a connection from remotePublicKey
      // if you do return false, else return true
      // remoteHandshakePayload contains their ip and some more info
      // console.log("firewall: ", { remotePublicKey, remoteHandshakePayload });
      getLogger().info(kleur.bgGreen(`${remotePublicKey} connected`));
      return false;
    },
  });

  p2pServer.on("connection", function (noiseSocket) {
    const host = props.tcp.host;
    const port = props.tcp.port;

    const requestSocket = connect({
      port,
      host,
    });

    pipeline(noiseSocket, requestSocket, noiseSocket, (err) => {
      if (err) {
        getLogger().error("pipeline failed: ", err);
        return;
      }
    });
  });

  await p2pServer.listen(hostAndKeyPair);

  return { p2pServer, hostAndKeyPair };
}
