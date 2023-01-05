// TypeScript (.ts)
import { Command } from "commander";
import { createWriteStream, existsSync } from "fs";
import { readFile } from "fs/promises";
import { createKeyPair } from "./src/create-key-pair.js";
import { share } from "./src/p2p/share.js";
import { connect } from "./src/p2p/connect.js";
import * as kleur from "kleur";
import type { Identity, SerializedIdentity } from "./src/identity.js";
import { APP_VERSION, DEBUG } from "./env.js";
import { setLogLevel } from "./src/logger.js";

if (DEBUG) {
  setLogLevel(30);
}

const IdentityPath = "./identity.json";

const program = new Command();

program
  .name("p2p-socket")
  .description("Use the @hyperswarm/dht to share and connect to p2p-sockets")
  .version(APP_VERSION);

addShareCommand(program);
addConnectCommand(program);
addIdCommand(program);

program.parse();

function addIdCommand(program) {
  program
    .command("create-id")
    .description(
      "Creates an identity.json file so that your shared p2p-sockets will have the same connect key. The identity.json file should be treated as a secret!"
    )
    .option(
      "-s, --seed [seed...]",
      "[optional] Passphrase to seed identity with",
      []
    )
    .action((options) => {
      if (hasLocalIdentity()) {
        console.error(
          kleur.red(
            `${IdentityPath} already exists. Please delete it if you want a new identity`
          )
        );
        return;
      }

      const parsedSeed = options.seed ? options.seed.join("") : undefined;

      const writeStream = createWriteStream(IdentityPath, {
        encoding: "utf-8",
      });

      writeStream.once("close", () => {
        console.log(
          kleur
            .green()
            .bold()
            .underline(`New identity created at ${IdentityPath}`)
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
    .description("Connect to a p2p-socket")
    .requiredOption("-k, --remote-key <key>", "[required] Remote share key")
    .option("-h, --host <host>", "[optional] default: localhost", "localhost")
    .option("-p, --port <port>", "[optional] default: 0", "0")
    .action(async (options) => {
      const { host, port, remoteKey } = options;

      const tcpServer = await connect({
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

      const proxy = await share({
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
  const dataBuffer = await readFile(IdentityPath);

  const data: SerializedIdentity = JSON.parse(dataBuffer.toString("utf-8"));

  return {
    keyPair: {
      publicKey: Buffer.from(data.keyPair.publicKey, "hex"),
      secretKey: Buffer.from(data.keyPair.secretKey, "hex"),
    },
  };
}

function hasLocalIdentity() {
  return existsSync(IdentityPath);
}
