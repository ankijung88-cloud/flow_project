import * as ftp from 'basic-ftp';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
    const client = new ftp.Client();
    // client.ftp.verbose = true;

    try {
        console.log("Connecting to Dothome FTP...");
        await client.access({
            host: "112.175.185.136",
            user: "ankijung",
            password: "Bingsoo2019@",
            port: 21,
            secure: false
        });

        console.log("Connected! Ensuring remote directory exists...");
        await client.ensureDir("/html");

        console.log("Clearing remote /html directory...");
        await client.clearWorkingDir();

        console.log("Uploading dist folder to /html...");
        await client.uploadFromDir("dist", "/html");

        console.log("Deployment successful!");
    } catch (err) {
        console.error("Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
