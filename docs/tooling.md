# Tooling: script'lar, git hook'lari, lint

Kim o'qiydi: **asosiy sessiya** va `lead` (verifikatsiya uchun). Agentlar bu faylni odatda o'qimaydi — ularga kerak bo'lgan bitta-ikkita buyruq o'z promptlarida yozilgan.

## Script'lar

| Buyruq                  | Izoh                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`           | `cross-env` + `tsx watch` — Windows'da ham ishlaydi. Mongo ishlab turishi kerak |
| `npm test`              | Vitest, bir marta. Ishlaydi                                                     |
| `npm run test:watch`    | Vitest watch rejimida                                                           |
| `npm run test:coverage` | v8 coverage → `coverage/`                                                       |
| `npm run type-check`    | `tsc --noEmit` (src) **va** `tsc -p tsconfig.test.json` (src + test) — ishlaydi |
| `npm run lint`          | ESLint 9 flat config, tip ma'lumotli — ishlaydi                                 |
| `npm run lint:fix`      | `eslint . --fix`                                                                |
| `npm run build`         | swc → `dist/src/`                                                               |
| `npm run clean`         | `rimraf dist` — Windows'da ham ishlaydi                                         |
| `npm run format`        | prettier                                                                        |

To'liq verifikatsiya ketma-ketligi (type-check → build → DB bootstrap → jonli HTTP smoke-test) `/verify` slash-buyrug'ida.

## Git hook'lari (husky)

`prepare: "husky"` — `npm install` dan keyin o'zi ulanadi. Yangi klonda qo'shimcha qadam kerak emas.

| Hook         | Nima ishlaydi                               | Vaqt |
| ------------ | ------------------------------------------- | ---- |
| `pre-commit` | `prettier --check .` + `npm run type-check` | ~13s |
| `pre-push`   | `npm test`                                  | ~8s  |

Testlar ataylab `pre-push` da: lokal commit'lar tez-tez bo'ladi, sekin `pre-commit` esa odamlarni `--no-verify` ga majburlaydi.

Formatlash tekshiruvi `pre-commit` da, chunki `.claude/hooks/format.mjs` faqat Claude'ning `Write`/`Edit` chaqiruvlarini ushlaydi — qo'lda yoki shell orqali yozilgan faylni emas.

## Lint

`eslint.config.mjs` — ESLint 9 flat config, **tip ma'lumotli** (`recommendedTypeChecked`). `.mjs` majburiy: loyiha CommonJS, `.js` ichida ESM sintaksisi yiqiladi.

**`projectService: true` ishlatmang.** U faylning eng yaqin `tsconfig.json` ini qidiradi; root config faqat `src/**` ni qamraydi va `tsconfig.test.json` nomi standart emas, shuning uchun `test/` dagi fayllar parse error beradi. `allowDefaultProject` ham yaramaydi — glob'da `**` taqiqlangan. Config'da ikkala loyiha aniq ko'rsatilgan.

Ikkita maqsadli yumshatish boshqa fayllarda hujjatlangan: `test/` dagi `no-unsafe-*` — [`testing.md`](./testing.md), skelet servislardagi fayl darajasidagi `eslint-disable` — [`backend.md`](./backend.md).

Formatlash butunlay Prettier'da: ESLint'da birorta stylistic qoida yo'q, shuning uchun `eslint-config-prettier` ham kerak emas.
