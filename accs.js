import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const importAccs = () => {
    let accs = [];
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/keys.json'), { encoding: 'utf8', flag: 'r' }));
    data.forEach(i => accs.push(i));
    return accs;
};

export const importProps = () => {
    let props = [];
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/props.json'), { encoding: 'utf8', flag: 'r' }));
    data.forEach(i => props.push(i));
    return props;
};