import keysJson from "./keys.json" assert { "type": "json" };

export const importAccs = () => {
  let accs = [];
  keysJson.forEach((i) => accs.push(i));
  return accs;
};
