#!/usr/bin/env node
/**
 * PostToolUse(Write|Edit) hook.
 *
 * Claude yozgan/tahrirlagan faylni loyihaning prettier sozlamalari
 * (.prettierrc.json - 4 space, single quotes, printWidth 100) bilan formatlaydi.
 *
 * Prinsiplar:
 *   - Hech qachon tool chaqiruvini bloklamaydi: har qanday xatoda exit 0.
 *   - Faqat loyiha ichidagi fayllarga tegadi.
 *   - npx emas, lokal prettier binary'si - har tahrirda ~1s tejaladi.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const hookDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(hookDir, '..', '..');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
    let filePath;
    try {
        const payload = JSON.parse(raw);
        filePath = payload.tool_input?.file_path ?? payload.tool_response?.filePath;
    } catch {
        process.exit(0);
    }
    if (!filePath) process.exit(0);

    // Loyihadan tashqaridagi fayllarni o'zgartirmaymiz.
    const absolutePath = path.resolve(projectDir, filePath);
    if (!absolutePath.startsWith(projectDir + path.sep)) process.exit(0);

    let prettierBin;
    try {
        const require = createRequire(path.join(projectDir, 'package.json'));
        prettierBin = require.resolve('prettier/bin/prettier.cjs');
    } catch {
        process.exit(0); // prettier o'rnatilmagan (npm install qilinmagan)
    }

    spawnSync(process.execPath, [prettierBin, '--ignore-unknown', '--write', absolutePath], {
        cwd: projectDir,
        stdio: 'ignore',
    });
    process.exit(0);
});
