import path from 'path';

export default jsFileName => path.basename(jsFileName).replace('.js', '.log').replace('.ts', '.log');
