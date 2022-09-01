import DHT from "@hyperswarm/dht";

export function createKeyPair(seed?: string) {
  return seed ? DHT.keyPair(createSeed(seed)) : DHT.keyPair();
}

function createSeed(seed: string) {
  // Topic must be 32 bytes
  return Buffer.alloc(32).fill(seed);
}
