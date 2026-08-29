# express-ts-boilerplate

Qayta ishlatiladigan Express 5 + TypeScript starter. Mongoose 8, typedi (DI), class-validator (DTO), zod (env), swc (build), CommonJS.

## ⚠️ Bu loyiha ataylab SKELET holatda

Domen logikasi va domen maydonlari **ataylab olib tashlangan**. Quyidagilar **bug emas**:

- `src/services/user.service.ts` — barcha metodlar `throw new Error('Not implemented')`
- `src/models/user.model.ts` — schema bo'sh (`// TODO: define fields`)
- `src/interfaces/user.interface.ts` — faqat `_id?`, `createdAt?`, `updatedAt?`
- `src/dtos/user.dto.ts` — bo'sh `class CreateUserDto {}`
- `GET /users` → `500 Not implemented` (dev) — kutilgan natija

Har bir yangi loyiha o'z entity'sini shu skelet ustiga yozadi. **Ularni "tuzatmang"** — implementatsiya yoki domen maydonlari qo'shish faqat aniq talab bo'lganda.

### Ma'lum g'alatilik: bo'sh DTO va validatsiya xabari

`POST /users` `400` qaytaradi, lekin xabar `"an unknown value was passed to the validate function"` bo'ladi — `"property foo should not exist"` emas.

Sababi: class-validator 0.14 da `forbidUnknownValues` default `true`, bo'sh klassda esa validatsiya metadatasi yo'q. DTO'ga birinchi dekorator (`@IsEmail()` va h.k.) qo'shilishi bilan normal xabarlar ishlaydi. Bu boilerplate kodidagi xato emas.

## Arxitektura

```
router → controller → service → model
```

- `src/app.ts` — `App` klassi: middleware'lar, router'lar, error handling. **`initialize()` ni `listen()` dan oldin `await` qiling** — DB ulanishi shu yerda.
- `src/server.ts` — `bootstrap()`: `new App([...])` → `await app.initialize()` → `app.listen()`. DB xatosi → `process.exit(1)`.
- Har bir router `Routes` interface'ini implement qiladi (`path` + `router`).

## Path alias'lar

`@config`, `@controllers`, `@database`, `@dtos`, `@exceptions`, `@interfaces`, `@middlewares`, `@models`, `@routers`, `@services`, `@utils` — har biri o'z papkasidagi `index.ts` ga. `@/*` → `src/*`.

Alias'lar **uch joyda** e'lon qilingan va sinxron turishi shart: `tsconfig.json` (`paths`), `.swcrc` (`jsc.paths`), va har papkadagi `index.ts` barrel eksporti. Yangi papka qo'shsangiz uchalasini ham yangilang.

## Konvensiyalar

**Javob formati** — har doim `{ success, message, data }`:

- Muvaffaqiyat: `res.success(data, statusCode?, message?)` (`ResponseMiddleware` `res` ga qo'shadi, default `200`/`'OK'`)
- Xato: `throw new HttpException(status, message)` — `ErrorMiddleware` ushlaydi
- `204` ishlatmang — Express body'ni tashlab yuboradi va javob formati buziladi

**Xatolar** (`src/middlewares/error.middleware.ts`):

- `HttpException` — operatsion xato: `status` va `message` client'ga o'zgarmasdan boradi, **prod'da ham**, 5xx bo'lsa ham. Xabari client uchun yozilgan deb hisoblanadi — shuning uchun unga maxfiy ma'lumot qo'ymang
- Boshqa har qanday xato — `500`; **prod'da** client `'Internal server error'` oladi, dev/test'da haqiqiy xabar. Maskalash sharti `!isHttpException`, `status >= 500` emas
- `stack` faqat serverda logga yoziladi

**Validatsiya** — `ValidationMiddleware(Dto, skipMissingProperties?, whitelist?, forbidNonWhitelisted?)`.
Default: `skipMissingProperties=false`, `whitelist=true`, `forbidNonWhitelisted=true`. Oxirgi ikkitasi mass-assignment'dan himoya qiladi — ularni `false` qilmang.

**404** — `app.ts` da catch-all `HttpException(404, ...)` beradi, shuning uchun noma'lum route ham bir xil JSON formatda qaytadi.

**Env** — `src/config/env.config.ts`, zod bilan validatsiya. `EnvVars` tipi `z.infer` orqali schema'dan olinadi — qo'lda dublikat yozmang. Yangi o'zgaruvchi = `envSchema` ga qo'shish + `.env.example` ni yangilash. `NODE_ENV` berilmasa `dev` ishlatiladi.

## `GET /health`

Readiness probe. DB ulanishi bo'lmasa (`mongoose` `readyState !== 1`) `503 Database unavailable` qaytaradi — `200 ok` emas, chunki DB'siz servis hech qanday foydali ish qila olmaydi. Ulanish holati `@database` dagi `isDbConnected()` orqali o'qiladi; router'lar mongoose'ni to'g'ridan-to'g'ri import qilmasin.

Muvaffaqiyatli javob: `{ status: 'ok', db: 'up', uptime, env }`.

`503` `HttpException` orqali tashlanadi, shuning uchun `'Database unavailable'` xabari prod'da ham client'ga yetib boradi.

## Git hook'lari (husky)

`prepare: "husky"` — `npm install` dan keyin o'zi ulanadi. Yangi klonda qo'shimcha qadam kerak emas.

| Hook         | Nima ishlaydi                               | Vaqt |
| ------------ | ------------------------------------------- | ---- |
| `pre-commit` | `prettier --check .` + `npm run type-check` | ~13s |
| `pre-push`   | `npm test`                                  | ~8s  |

Testlar ataylab `pre-push` da: lokal commit'lar tez-tez bo'ladi, sekin `pre-commit` esa odamlarni `--no-verify` ga majburlaydi.

Formatlash tekshiruvi `pre-commit` da, chunki `.claude/hooks/format.mjs` faqat Claude'ning `Write`/`Edit` chaqiruvlarini ushlaydi — qo'lda yoki shell orqali yozilgan faylni emas.

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

## Testlar

**Vitest + supertest + mongodb-memory-server.** Infratuzilma tayyor va ishlaydi — `npm test`.

```
test/
├── global-setup.ts        # butun run uchun BITTA in-memory mongod
├── setup.ts               # har worker'da env'ni @config import'idan oldin to'g'rilaydi
├── helpers/               # createTestApp, connectTestDb, clearTestDb, disconnectTestDb
└── infrastructure.test.ts # muhitning o'zini tekshiradi (domenga bog'liq emas)
```

Test fayllari `test/` ichida, `*.test.ts`. Alias'lar u yerda ham ishlaydi (Vite `resolve.tsconfigPaths` + `tsconfig.test.json`).

Bilish kerak bo'lgan uchta nozik joy:

1. **env `process.exit(1)` xavfi.** `env.config.ts` modul yuklanganda validatsiya qiladi; xato bo'lsa jarayon **jim o'ladi**. `test/setup.ts` `process.env` ni oldindan to'ldiradi (dotenv mavjud o'zgaruvchini almashtirmaydi, shuning uchun in-memory DB qiymatlari ustun turadi). `.env.test` commit qilingan — `.gitignore` da `!/.env.test` istisnosi bor.
2. **Dekorator metadatasi.** Vitest'ning default esbuild transformeri `emitDecoratorMetadata` ni qo'llab-quvvatlamaydi, loyiha esa typedi va class-validator dekoratorlariga tayanadi. `unplugin-swc` mavjud `.swcrc` ni qayta ishlatadi — build bilan test o'rtasida farq yo'q.
3. **`test/setup.ts` da top-level `await` ishlatmang** — `module: commonjs` da `tsc` dan o'tmaydi. Async ish `global-setup.ts` ga tegishli.

Integratsiya testida `app.listen()` chaqirmang: `createTestApp([new SomeRouter()])` → `supertest(app)`. To'liq app orqali o'tish shart, chunki `res.success()` va 404/error kontrakti middleware'larda yig'iladi.

## Lint

`eslint.config.mjs` — ESLint 9 flat config, **tip ma'lumotli** (`recommendedTypeChecked`). `.mjs` majburiy: loyiha CommonJS, `.js` ichida ESM sintaksisi yiqiladi.

Uchta narsani bilib qo'ying:

1. **`projectService: true` ishlatmang.** U faylning eng yaqin `tsconfig.json` ini qidiradi; root config faqat `src/**` ni qamraydi va `tsconfig.test.json` nomi standart emas, shuning uchun `test/` dagi fayllar parse error beradi. `allowDefaultProject` ham yaramaydi — glob'da `**` taqiqlangan. Config'da ikkala loyiha aniq ko'rsatilgan.
2. **`no-unsafe-*` oilasi `test/` da o'chirilgan.** `supertest` javobining `body` tipi `any` (`@types/superagent`) — bu kutubxona chegarasi, bizning kodimiz emas. `src/` da qoida kuchida.
3. **Skelet servislar fayl darajasidagi `eslint-disable` izohi bilan.** Config'da glob override **ataylab ishlatilmagan** — u butun service qatlamini doimiy ko'r qilardi. Izoh esa implementatsiya yozilganda o'chiriladi. `/scaffold` yangi servislarga uni o'zi qo'shadi.

Formatlash butunlay Prettier'da: ESLint'da birorta stylistic qoida yo'q, shuning uchun `eslint-config-prettier` ham kerak emas.

## Kod uslubi

4 space indent, single quotes, trailing comma `all`, printWidth 100, semicolon majburiy (`.prettierrc.json`).

## Tarix

Bajarilgan ishlar va qabul qilingan qarorlar: [PROGRESS.md](./PROGRESS.md)
