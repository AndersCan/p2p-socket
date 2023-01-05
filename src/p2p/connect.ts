/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import { DHT } from "./dht";
import * as net from "net";
import { pipeline } from "stream";
import { getLogger } from "../logger";

interface Props {
  tcp: {
    host: string;
    port: number;
  };
  remotePublicKey: Buffer;
}
/**
 * Connect to a p2p-socket
 */
export function connect(props: Props) {
  const node = new DHT();

  const { host, port } = props.tcp;
  const tcpServer = net.createServer();

  tcpServer.on("connection", (socket) => {
    const p2pSocket = node.connect(props.remotePublicKey);

    pipeline(socket, p2pSocket, socket, (err) => {
      if (err) {
        getLogger().error("pipeline failed: ", err);
        return;
      }
    });
  });

  return new Promise<net.Server>((resolve) => {
    tcpServer.listen(
      {
        host,
        port,
      },
      () => {
        resolve(tcpServer);
      }
    );
  });
}
