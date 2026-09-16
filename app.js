const http =  require('http');
const fs = require('fs');
const PORT = 3000;

const server = http.createServer((req, res) => {
    res.write("Salut david");
    res.end();
})

server.listen(PORT);

console.log("server running on port " + PORT);
