"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the ${chalk.red("create-lean-jsx-app")} generator!`)
    );

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Set a name for your project",
        default: "myapp"
      },
      {
        type: "input",
        name: "description",
        message: "A description for your project",
        default: "A lean.js-powered web application!"
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    const src = this.sourceRoot();
    const dest = this.destinationPath(`${this.props.name}`);

    //The ignore array is used to ignore files, push file names into this array that you want to ignore.
    const copyOpts = {
      globOptions: {
        ignore: []
      }
    };

    this.fs.copy(src, dest, copyOpts);
    this.fs.copy(
      this.templatePath(".build/*"),
      this.destinationPath(`${this.props.name}/.build`)
    );
    this.fs.copy(
      this.templatePath(".*"),
      this.destinationPath(`${this.props.name}`)
    );

    const files = ["package.json", "src/index.html"];

    const opts = {
      name: this.props.name,
      description: this.props.description
    };

    files.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(`${this.props.name}/${file}`),
        opts,
        copyOpts
      );
    });
  }

  install() {
    const appDir = path.join(process.cwd(), this.props.name);
    process.chdir(appDir);
    this.spawnCommandSync("npm", ["link", "lean-jsx"]);
    this.npmInstall();
  }

  end() {
    this.spawnCommandSync("git", ["init", "-b", "main"]);
  }
};
