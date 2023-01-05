import { DHT } from "./src/p2p/dht";
import { createKeyPair } from "./src/create-key-pair";
const seed = process.argv[2];

console.log({ seed });

const keyPair = seed ? createKeyPair(seed) : DHT.keyPair();
console.log("secretKey:", keyPair.secretKey.toString("hex"));
console.log("publicKey:", keyPair.publicKey.toString("hex"));
