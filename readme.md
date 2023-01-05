# p2p-socket

Use the @hyperswarm/dht to share and connect to p2p-sockets.

Run `npx p2p-socket --help` for usage instuctions

## Quick start

A p2p-socket is just a eazy way to connect to another machine over the internet.

### Share p2p-socket

To share `localhost:3000` with the P2P network run:

```bash
npx p2p-socket share --port 3000
```

This will print the connection information that you will have to share with whoever you want to connect to your machine.

### Connect to p2p-socket

To connect p2p-socket

```bash
npx p2p-socket connect --port 3000 --remote-key <remote-key>
```

The p2p-socket is now available on `localhost:3000`.

## Persistant remote-key

To avoid having to reshare your connection information each time you restart your server, run `npx p2p-socket create-id`. This will create an `identity.json` file locally. This will enable a consistent `remote-key`.

> Note: The key will change when changing the `port`.

## Acknowledgements

Inspired by [hyperswarm-http-server](https://github.com/mafintosh/hyperswarm-http-server)
