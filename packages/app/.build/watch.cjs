const { context } = require("esbuild");
const { resolve } = require("path");
const { build: viteBuild } = require("vite");
const nodemon = require("nodemon");
const { getConfig } = require("./common.cjs");

async function buildApp() {
    const conf = await getConfig();

    await viteBuild(conf.web).catch((err) => {
        console.error(err);
        process.exit();
    });

    console.log("==Building server==");
    const awaited = await context(conf.server.esbuildOptions).catch((err) => {
        console.error(err);
        process.exit();
    });

    await awaited.watch().catch((err) => {
        awaited.dispose();
        console.error(err);
        process.exit();
    });

    return {
        serverOutDir: conf.server.outdir,
        main: conf.server.main,
    };
}

async function startServer() {
    const { serverOutDir, main } = await buildApp();

    setTimeout(() => {
        nodemonServer = nodemon({
            script: main, // Your script that nodemon will restart on changes
            ext: "js json ts tsx", // Watched extensions
            env: { NODE_ENV: "development" }, // Environment variables
            delay: 1,
            watch: main,
        });

        nodemon
            .on("start", () => {
                console.log("Server has started");
            })
            .on("quit", () => {
                console.log("Server has quit");
                process.exit();
            })
            .on("restart", (files) => {
                console.log("Server restarted due to:", files);
            });
    }, 100);
}

startServer();
