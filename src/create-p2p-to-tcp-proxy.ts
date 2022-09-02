/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import DHT from "@hyperswarm/dht";
import { connect } from "net";
import { createKeyPair } from "./create-key-pair";
import { PassThrough, pipeline } from "stream";
import kleur from "kleur";

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
      console.log(kleur.bgGreen(`${remotePublicKey} connected`));
      return false;
    },
  });

  p2pServer.on("connection", function (noiseSocket) {
    const host = props.tcp.host;
    const port = props.tcp.port;

    const requestSocket = connect({
      port,
      host,
      // allowHalfOpen: false,
      // keepAlive: false,
    });

    const requestLogger = new PassThrough({
      transform(chunk, encoding, callback) {
        console.log("REQUEST:", chunk.toString("utf-8"));
        callback(null, chunk);
      },
    });
    // const responseLogger = new PassThrough({
    //   transform(chunk, encoding, callback) {
    //     console.log("RESPONSE:", chunk.toString("utf-8"));
    //     callback(null, chunk);
    //   },
    // });

    pipeline(
      noiseSocket,
      requestLogger,
      requestSocket,
      // responseLogger,
      noiseSocket,
      (err) => {
        if (err) {
          console.error("pipeline failed: ", err);
          return;
        }
        console.log("pipeline done");
      }
    );
  });

  await p2pServer.listen(hostAndKeyPair);

  return { p2pServer, hostAndKeyPair };
}
