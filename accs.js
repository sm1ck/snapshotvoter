import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as stream from "stream";
import { once } from "events";

const __dirname = path.resolve();

export const importAccs = async () => {
  let accs = [];
  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/keys.json"), {
      encoding: "utf8",
      flag: "r",
    })
  );
  data.forEach((i) => accs.push(i));
  if (accs.length === 0) {
    accs = await importTxtAccs();
  }
  return accs;
};

const importTxtAccs = async () => {
  let accs = [];
  let instream = fs.createReadStream(path.join(__dirname, "./keys.txt"));
  let outstream = new stream.Stream();
  let rl = readline.createInterface(instream, outstream);
  rl.on("line", (line) => {
    accs.push(line);
  });
  await once(rl, "close");
  return accs;
};

export const importProxies = async () => {
  let proxies = [];
  let instream = fs.createReadStream(path.join(__dirname, "./proxies.txt"));
  let outstream = new stream.Stream();
  let rl = readline.createInterface(instream, outstream);
  rl.on("line", (line) => {
    proxies.push(line);
  });
  await once(rl, "close");
  return proxies;
};

export const importProps = () => {
  let props = [];
  let data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/props.json"), {
      encoding: "utf8",
      flag: "r",
    })
  );
  data.forEach((i) => props.push(i));
  return props;
};
