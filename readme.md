![Banner image of three pears](https://raw.githubusercontent.com/AndersCan/p2p-socket/main/banner.jpg)

# p2p-socket

Connect two machines across the web together via the [@hyperswarm/dht](https://github.com/holepunchto/hyperswarm-dht).

## Highlights

- Free
- Encrypted end-to-end.
- No sentral server
  - Connections are direct between machines (Peer to Peer)

Run `npx p2p-socket --help` for usage instuctions. Currently only supports TCP, but UDP can/will be added later.

## Quick start

A p2p-socket is just an easy way to connect to another machine over the internet. Here is a step-by-step guide on how Alice can share `localhost:3000` with Bob.

### Sharing

For Alice to share `localhost:3000` with Bob, she would run:

```bash
# Alice
npx p2p-socket share --port 3000
```

This will print the connection information that Alice will have to share with Bob. Note that nobody on the network will find Alice unless she shares her public key with them.

### Connect

To connect, Bob will run:

```bash
# Bob
npx p2p-socket connect --port 3000 --remote-key <alice-public-key>
```

Bob can now access `localhost:3000` and reach Alice.

## Persistant remote-key

To avoid having to reshare your connection information each time you restart your server, run `npx p2p-socket create-id`. This will create an `identity.json` file locally. This will enable a consistent `remote-key`.

> Note: The key will still change if you change `port`

## Acknowledgements

Inspired by [hyperswarm-http-server](https://github.com/mafintosh/hyperswarm-http-server) and made possible by [🕳🥊Holepunch](https://holepunch.to/) tech.
