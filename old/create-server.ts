/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import DHT from "@hyperswarm/dht";
import { createServer } from "http";
import { pipeline } from "stream";

interface Props {
  http: {
    host: string;
    port: number;
  };
  keyPair: {
    secretKey: string;
    publicKey: string;
  };
}
export function createHTTPtoP2PServer(props: Props) {
  const node = new DHT();
  // create a server to listen for secure connections
  const p2pServer = node.createServer({
    firewall(remotePublicKey, remoteHandshakePayload) {
      // validate if you want a connection from remotePublicKey
      // if you do return false, else return true
      // remoteHandshakePayload contains their ip and some more info
      console.log({ remotePublicKey, remoteHandshakePayload });
      return true;
    },
  });

  const httpServer = createServer((req, res) => {
    p2pServer.on("connection", function (socket) {
      // socket is E2E encrypted between you and the other peer

      console.log(Object.keys(socket));
      console.log("Remote public key", socket.remotePublicKey);
      // same as keyPair.publicKey
      console.log("Local public key", socket.publicKey);

      pipeline(req, socket, res, (err) => {
        if (err) {
          console.error("pipeline failed: ", err);
          return;
        }
      });
    });
  });

  const { host, port } = props.http;
  httpServer.listen({ host, port }, () => {
    console.log("listening: ", httpServer.address());
  });

  return p2pServer;
}
