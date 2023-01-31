/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import { DHT } from "./dht.js";
import * as net from "net";
import { pipeline } from "stream";
import { getLogger } from "../logger.js";

interface Props {
  tcp: {
    host: string;
    port: number;
  };
  remotePublicKey: Buffer;
  bootstrap?: Array<{ host: string; port: number }>;
}
/**
 * Connect to a p2p-socket
 */
export function connect(props: Props) {
  const keyPair = DHT.keyPair();
  const node = new DHT({ bootstrap: props.bootstrap });
  const { host, port } = props.tcp;
  const tcpServer = net.createServer();

  tcpServer.on("connection", (socket) => {
    const p2pSocket = node.connect(props.remotePublicKey, { keyPair });

    pipeline(socket, p2pSocket, socket, (err) => {
      if (err) {
        // TODO: Investigate socket errors (https://www.howtouselinux.com/post/check-connection-reset-by-peer)
        const thisIsFine =
          err.code === "ERR_STREAM_PREMATURE_CLOSE" ||
          err.message === "Writable stream closed prematurely";
        if (thisIsFine) {
          return;
        }
        getLogger().error(err);
        return;
      }
    });
  });

  const disconnect = () => {
    tcpServer.close();
    node.destroy();
  };

  return new Promise<{ tcpServer: net.Server; disconnect: () => void }>(
    (resolve) => {
      tcpServer.listen(
        {
          host,
          port,
        },
        () => {
          resolve({ tcpServer, disconnect });
        }
      );
    }
  );
}
