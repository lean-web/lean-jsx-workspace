import { createEnv } from "yeoman-environment";
const env = createEnv();

// env.register(import("./generators/app/index.js"), "lean-jsx");
env.lookup();

env.run("create-lean-jsx-app", {}, err => {
    if (err) {
        console.error("Error while generating:", err);
    } else {
        console.log("Generation complete.");
    }
});
