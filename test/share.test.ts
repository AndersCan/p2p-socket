import { createKeyPair } from "../src/create-key-pair";
import { DHT, Node } from "../src/p2p/dht";
import { share } from "../src/p2p/share";
import { connect } from "../src/p2p/connect";
import { createServer } from "http";
import { request } from "undici";
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

describe("share ", () => {
  it("can share a port and connect to it", async () => {
    const nodes: Node[] = [];
    try {
      const first = new DHT({
        ephemeral: true,
        // firewalled: false,
        bootstrap: [],
        port: 0,
      });
      await first.ready();
      nodes.push(first);
      const bootstrap = [{ host: "127.0.0.1", port: first.address().port }];

      // Need at least one extra node otherwise the test fails. Unsure why.
      let i = 1;
      while (i-- > 0) {
        const node = new DHT({ bootstrap, ephemeral: false });
        await node.ready();
        nodes.push(node);
      }

      const closeHttp = await httpServer(8888);
      const keyPair = createKeyPair();

      const { unshare, hostAndKeyPair } = await share({
        tcp: {
          host: "127.0.0.1",
          port: 8888,
        },
        keyPair: keyPair,
        bootstrap,
      });

      const { disconnect } = await connect({
        tcp: {
          host: "127.0.0.1",
          port: 8989,
        },
        remotePublicKey: hostAndKeyPair.publicKey,
        bootstrap,
      });

      const { statusCode, headers, body } = await request(
        "http://127.0.0.1:8989/"
      );

      const text = await body.text();
      assert.deepStrictEqual(statusCode, 200);
      assert.deepStrictEqual(headers["content-type"], "text/html");
      assert.deepStrictEqual(text, "<h1>hello, world</h1>");

      // cleanup
      disconnect();
      unshare();
      closeHttp();
      await Promise.all(nodes.map((node) => node.destroy()));
      await first.destroy();
    } catch (err) {
      console.error(err);
      // Easy cleanup :)
      process.exit(1);
    }
  });
});

function httpServer(port: number) {
  return new Promise<() => void>((resolve) => {
    const server = createServer((req, res) => {
      if (req.url !== "/") {
        res.writeHead(404, "NotFound");
        res.end("");
        return;
      }
      res.writeHead(200, { "content-type": "text/html" });
      res.write("<h1>hello, world</h1>");
      res.end("");
      return;
    }).listen(port, "0.0.0.0", () => {
      return resolve(() => {
        server.close();
      });
    });
  });
}
