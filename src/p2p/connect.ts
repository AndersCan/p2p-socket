/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import { DHT } from "./dht.js";
import * as net from "net";
import { socketPipe } from "../proxy/socket-pipe.js";

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
    const id = `${Math.random()}`.slice(2);
    const p2pSocket = node.connect(props.remotePublicKey, { keyPair });
    socketPipe(socket, p2pSocket, id);
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
