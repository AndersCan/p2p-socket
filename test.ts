import { connect, createConnection } from "net";

main();

async function main() {
  console.log("createconnection");
  const socket = connect({
    port: 80,
    host: "google.com",
  });
  console.log("done");

  socket.on("data", (data) => {
    console.log(data.toString("utf-8"));
  });
  socket.on("error", (error) => {
    console.log(error);
  });
  socket.on("end", () => {
    console.log("end");
  });

  socket.write(`GET / HTTP/1.1
Host: www.google.com
User-Agent: curl/7.64.1
Accept: */*

`);
}
async function mainsocket() {
  console.log("createconnection");
  const socket = createConnection(3000, "0.0.0.0");
  console.log("done");

  console.log(socket);
  for await (const chunck of socket) {
    console.log("chunck");
    console.log(chunck);
  }
}
