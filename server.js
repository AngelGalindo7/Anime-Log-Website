const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
const path = require('path');

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'yourUsername',
//     password: 'yourPassword',
//     database: 'yourDatabase'
// });

// db.connect(err => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL');
// });

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Serve the index.html file
    if (req.url === '/' && req.method === 'GET') {
        const filePath = path.join(__dirname, 'index2.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }
});

// Start the server on port 3000
const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
