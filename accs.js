import * as fs from 'fs';
import * as path from 'path';

const __dirname = path.resolve();

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