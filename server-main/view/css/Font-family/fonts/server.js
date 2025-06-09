import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer(async (req, res) => {
    if (req.url === '/') {
        try {
            const content = await readFile(join(__dirname, 'convert.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (err) {
            res.writeHead(500);
            res.end('Error loading converter');
        }
    }
});

server.listen(3000, () => {
    console.log('Font converter running at http://localhost:3000');
}); 