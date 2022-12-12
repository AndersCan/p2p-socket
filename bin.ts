// TypeScript (.ts)
import { Command } from "commander";
import { createWriteStream, existsSync } from "fs";
import { readFile } from "fs/promises";
import { createKeyPair } from "./src/create-key-pair";
import { createP2PtoTCPProxy } from "./src/create-p2p-to-tcp-proxy.js";
import { createTCPtoP2PProxy } from "./src/create-tcp-to-p2p-proxy";
import kleur from "kleur";
import type { Identity, SerializedIdentity } from "./src/identity";
import { APP_VERSION, DEBUG } from "./env";
import { setLogLevel } from "./src/logger";

if (DEBUG) {
  setLogLevel(30);
}

const program = new Command();

program
  .name("p2p-socket")
  .description("Use the @hyperswarm/dht to connect to peers from anywhere")
  .version(APP_VERSION);

addIdCommand(program);
addShareCommand(program);
addConnectCommand(program);

program.parse();

function addIdCommand(program) {
  program
    .command("id")
    .description(
      "Creates an identity.json file for static remote-key. The identity is secret!"
    )
    .option(
      "-s, --seed [seed...]",
      "[optional] Passphrase to seed identity with",
      []
    )
    .action((options) => {
      const path = "./identity.json";

      if (hasLocalIdentity()) {
        console.error(
          kleur.red(
            `${path} already exists. Please delete it if you want a new identity`
          )
        );
        return;
      }

      const parsedSeed = options.seed ? options.seed.join("") : undefined;

      const writeStream = createWriteStream(path, { encoding: "utf-8" });

      writeStream.once("close", () => {
        console.log(
          kleur.green().bold().underline(`New identity created at ${path}`)
        );
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
    .option("-h, --host <host>", "[optional] default: localhost", "localhost")
    .option("-p, --port <port>", "[optional] default: 0", "0")
    .action(async (options) => {
      const { host, port, remoteKey } = options;

      const tcpServer = await createTCPtoP2PProxy({
        tcp: {
          host,
          port: Number(port),
        },
        remotePublicKey: Buffer.from(remoteKey, "hex"),
      });
      const address = tcpServer.address();

      let listenPort: number = 0;
      if (address && typeof address === "object") {
        listenPort = address.port;
      }

      console.log(
        kleur
          .green()
          .bold()
          .underline(`P2P proxy reachable via ${host}:${listenPort}`)
      );
    });
}

function addShareCommand(program: Command) {
  program
    .command("share")
    .description(
      "Share something with the P2P network. Peers will use your publicKey to connect"
    )
    .requiredOption("-p, --port <port>", "[required] Port")
    .option(
      "-h, --host <host>",
      "[optional] host default: localhost",
      "localhost"
    )
    .action(async (options) => {
      const identity = await getIdentity();

      const { host, port } = options;

      const proxy = await createP2PtoTCPProxy({
        tcp: {
          host,
          port: Number(port),
        },
        keyPair: identity.keyPair,
      });

      const remoteKey = proxy.hostAndKeyPair.publicKey.toString("hex");

      console.log(
        kleur
          .dim()
          .underline(`You are now sharing ${host}:${port} with P2P network`)
      );
      console.log();
      console.log(kleur.bold(`Peers can connect to you by running:`));

      console.log(
        kleur
          .italic()
          .underline(
            `npx p2p-socket@${APP_VERSION} connect --port ${port} --remote-key ${remoteKey}`
          )
      );
    });
}

async function getIdentity(): Promise<Identity> {
  if (hasLocalIdentity()) {
    return getLocalIdentity();
  }

  return {
    keyPair: createKeyPair(),
  };
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

function hasLocalIdentity() {
  const path = "./identity.json";
  return existsSync(path);
}
