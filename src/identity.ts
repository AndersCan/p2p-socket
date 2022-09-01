export interface Identity {
  keyPair: {
    publicKey: Buffer;
    secretKey: Buffer;
  };
}

export interface SerializedIdentity {
  keyPair: {
    publicKey: string;
    secretKey: string;
  };
}
