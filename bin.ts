// TypeScript (.ts)
import { Command } from "commander";
import { createWriteStream } from "fs";
import { readFile } from "fs/promises";
import { createKeyPair } from "./src/create-key-pair";
import { createP2PtoTCPProxy } from "./src/create-p2p-to-tcp-proxy.js";
import { createTCPtoP2PProxy } from "./src/create-tcp-to-p2p-proxy";
import type { Identity, SerializedIdentity } from "./src/identity";

const program = new Command();

program
  .name("p2p-socket")
  .description("Use the @hyperswarm/dht to connect to peers from anywhere")
  .version("0.0.1");

addInitCommand(program);
addShareCommand(program);
addConnectCommand(program);

program.parse();

function addInitCommand(program) {
  program
    .command("init")
    .description(
      "Creates and stores an identity on this machine. The identity is secret!"
    )
    .option(
      "-s, --seed [seed...]",
      "[optional] Passphrase to seed identity with",
      []
    )
    .action((options) => {
      const parsedSeed = options.seed ? options.seed.join("") : undefined;

      const writeStream = createWriteStream("./identity.json");

      writeStream.once("close", () => {
        console.log("done");
      });
      const newKeyPair = createKeyPair(parsedSeed);
      const identity: SerializedIdentity = {
        keyPair: {
          publicKey: newKeyPair.publicKey.toString("hex"),
          secretKey: newKeyPair.secretKey.toString("hex"),
        },
      };

      writeStream.write(JSON.stringify(identity, null, 2));
      writeStream.close();
    });
}

function addConnectCommand(program: Command) {
  program
    .command("connect")
    .description("Connect over P2P network to a shared resource")
    .requiredOption("-k, --remote-key <key>", "[required] Remote Public key")
    .option("-h, --host <host>", "[optional] Local")
    .option("-p, --port <port>", "[optional] Local")
    .action(async (options) => {
      const { host, port, remoteKey } = options;

      await createTCPtoP2PProxy({
        tcp: {
          host,
          port,
        },
        remotePublicKey: Buffer.from(remoteKey, "hex"),
      });
      console.log(`P2P proxy reachable via ${host}:${port}`);
    });
}

function addShareCommand(program: Command) {
  program
    .command("share")
    .description(
      "Share something with the P2P network. Peers will use your publicKey to connect"
    )
    .requiredOption("-h, --host <host>", "[required] Host")
    .requiredOption("-p, --port <port>", "[required] Port")
    .action(async (options) => {
      const identity = await getLocalIdentity();
      const { host, port } = options;
      await createP2PtoTCPProxy({
        tcp: {
          host,
          port,
        },
        keyPair: identity.keyPair,
      });

      console.log(
        `P2P server listening on ${identity.keyPair.publicKey.toString("hex")}`
      );

      console.log(
        `npx p2p-socket connect ${identity.keyPair.publicKey.toString("hex")}`
      );
    });
}

async function getLocalIdentity(): Promise<Identity> {
  const data = await readFile("./identity.json");

  const datax: SerializedIdentity = JSON.parse(data.toString("utf-8"));

  return {
    keyPair: {
      publicKey: Buffer.from(datax.keyPair.publicKey, "hex"),
      secretKey: Buffer.from(datax.keyPair.secretKey, "hex"),
    },
  };
}
