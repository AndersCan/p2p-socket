/**
 * Create a host machine that accepts connections and redirects them to localhost something
 **/
import DHT from "@hyperswarm/dht";
import * as net from "net";
import { pipeline, PassThrough } from "stream";

interface Props {
  tcp: {
    host: string;
    port: number;
  };
  remotePublicKey: Buffer;
}
export function createTCPtoP2PProxy(props: Props) {
  const node = new DHT();

  const { host, port } = props.tcp;
  const tcpServer = net.createServer({
    allowHalfOpen: false,
    keepAlive: false,
  });

  tcpServer.on("connection", (socket) => {
    // socket is E2E encrypted between you and the other peer
    // const socket = node.connect(key);
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

    const p2pSocket = node.connect(props.remotePublicKey, {
      reusableSocket: false,
    });

    pipeline(
      socket,
      requestLogger,
      p2pSocket,
      // responseLogger,
      socket,
      (err) => {
        if (err) {
          console.error("pipeline failed: ", err);
          return;
        }
        console.log("pipeline done");
      }
    );
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
