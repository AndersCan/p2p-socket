const fastify = require("fastify")({ logger: true });
const path = require("path");
const fs = require("fs/promises");

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "/"),
  prefix: "/", // optional: default '/',
  list: {
    format: "html",
    render: (dirs, files) => {
      return `
<html><body>
<ul>
  ${dirs
    .map((dir) => `<li><a href="${dir.href}">${dir.name}</a></li>`)
    .join("\n  ")}
</ul>
<ul>
  ${files
    .map(
      (file) =>
        `<li><a href="${file.href}" target="_blank">${file.name}</a></li>`
    )
    .join("\n  ")}
</ul>
</body></html>
`;
    },
  },
});

fastify.get("/", async function (req, reply) {
  const folders = await fs.readdir("./");

  const list = folders
    .map(
      (filename) =>
        `<li><a href="/${filename}" target="_blank">${filename}</a></li>`
    )
    .join(" ");
  return reply
    .type("text/html")
    .send(`<html><body><ul>${list}</ul></body></html>`); // serving path.join(__dirname, 'public', 'myHtml.html') directly
});

fastify.listen({ port: 3000 });
