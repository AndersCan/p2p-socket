# p2p-socket

Share and connect to any socket over a P2P network powered by `@hyperswarm/dht`

Run `npx p2p-socket --help` for usage instuctions

## Quick start
To share your port `3000` with the P2P network run:
```bash
npx p2p-socket share --port 3000
```
This will give you a remote-key that you should share with whoever you want to connect to your machine.

To connect to a remote machine run:

```bash
npx p2p-socket connect --port 3000 --remote-key <remote-key>
```

Run `p2p-socket init` to create a `identity.json` file that will enable a consistent `remote-key` when sharing the same port.

---


```
Usage: p2p-socket [options] [command]

Use the @hyperswarm/dht to connect to peers from anywhere

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  init [options]     Creates and stores an identity on this machine. The identity is secret!
  share [options]    Share something with the P2P network. Peers will use your publicKey to
                     connect
  connect [options]  Connect over P2P network to a shared resource
  help [command]     display help for command
```


## Acknowledgements
Inspired by [hyperswarm-http-server](https://github.com/mafintosh/hyperswarm-http-server)