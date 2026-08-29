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
- `HttpException` — operatsion xato, `status` va `message` client'ga boradi
- Boshqa har qanday xato — `500`; **prod'da** client `'Internal server error'` oladi, dev/test'da haqiqiy xabar
- `stack` faqat serverda logga yoziladi

**Validatsiya** — `ValidationMiddleware(Dto, skipMissingProperties?, whitelist?, forbidNonWhitelisted?)`.
Default: `skipMissingProperties=false`, `whitelist=true`, `forbidNonWhitelisted=true`. Oxirgi ikkitasi mass-assignment'dan himoya qiladi — ularni `false` qilmang.

**404** — `app.ts` da catch-all `HttpException(404, ...)` beradi, shuning uchun noma'lum route ham bir xil JSON formatda qaytadi.

**Env** — `src/config/env.config.ts`, zod bilan validatsiya. `EnvVars` tipi `z.infer` orqali schema'dan olinadi — qo'lda dublikat yozmang. Yangi o'zgaruvchi = `envSchema` ga qo'shish + `.env.example` ni yangilash. `NODE_ENV` berilmasa `dev` ishlatiladi.

## Script'lar

| Buyruq | Izoh |
|---|---|
| `npm run dev` | ⚠️ **Windows'da ishlamaydi** — `NODE_ENV=dev` bash sintaksisi. Vaqtinchalik: `npx cross-env NODE_ENV=dev npx tsx watch src/server.ts` |
| `npm test` | Vitest, bir marta. Ishlaydi |
| `npm run test:watch` | Vitest watch rejimida |
| `npm run test:coverage` | v8 coverage → `coverage/` |
| `npm run type-check` | `tsc --noEmit` (src) **va** `tsc -p tsconfig.test.json` (src + test) — ishlaydi |
| `npm run build` | swc → `dist/src/` |
| `npm run format` | prettier |

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

## Ma'lum tooling muammolari (hali tuzatilmagan)

- **ESLint umuman ishlamaydi** — v9 o'rnatilgan, lekin config eski `.eslintrc.json` formatida. `eslint.config.js` (flat config) kerak. `lint` script'i ham yo'q.
- `npm run dev` va `npm run clean` bash sintaksisida — Windows'da yiqiladi (`cross-env`/`rimraf` o'rnatilgan, lekin ishlatilmagan).
- `package.json` `main` → `dist/server.js`, lekin `start` → `dist/src/server.js`. swc chindan `dist/src/` ga chiqaradi.
- `build` script'ida `-d dist/test` va `--out-dir dist` ikkalasi bir vaqtda.
- Ortiqcha dep'lar: `nodemon`, `ts-node`, `ts-node-dev` (`tsx` yetarli). `rimraf` `dependencies` da.
- `husky` o'rnatilgan, lekin `.husky/` va `prepare` script'i yo'q.

## Kod uslubi

4 space indent, single quotes, trailing comma `all`, printWidth 100, semicolon majburiy (`.prettierrc.json`).

## Tarix

Bajarilgan ishlar va qabul qilingan qarorlar: [PROGRESS.md](./PROGRESS.md)
