// generate-build-time.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildTime = new Date().toISOString();

const content = `// Auto-generated at build time
export const BUILT_AT = '${buildTime}';`;

fs.writeFileSync(path.join(__dirname, '../src/buildTime.config.ts'), content);
