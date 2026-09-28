import { transform } from '@astrojs/compiler-rs';
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2], 'utf8');
try { const r = await transform(src, { filename: 'x.astro' }); console.log(JSON.stringify(r.diagnostics || r.errors || 'ok').slice(0, 500)); } catch (e) { console.log('ERR', e.message); }
