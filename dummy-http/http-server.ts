import { createServer } from "http";

createServer((req, res) => {
  if (req.url !== "/") {
    res.writeHead(404, "NotFound");
    res.end("");
    return;
  }

  console.log("got request", req.url);
  res.on("close", () => {
    console.log("res ended");
  });
  res.writeHead(200, { "content-type": "text/html" });
  res.write(`<h1 id="test">hello, world</h1>`);
  res.write("<p>1</p>");
  res.write("<p>2</p>");
  res.write("<p>3</p>");
  res.write(
    `<script>document.getElementById('test').innerText =+ Date.now()</script>`
  );
  res.end("");

  return;
}).listen(3000, "0.0.0.0", () => console.log("http://localhost:3000"));
