# `.claude/`

Bu loyihaning Claude Code sozlamalari. Loyiha kontekstining o'zi ildizdagi [`CLAUDE.md`](../CLAUDE.md) da (har sessiyada avtomatik yuklanadi), bajarilgan ishlar jurnali esa [`PROGRESS.md`](../PROGRESS.md) da.

```
.claude/
├── README.md              # shu fayl
├── settings.json          # commit qilinadi - jamoa uchun umumiy
├── settings.local.json    # gitignore - shaxsiy, ixtiyoriy
├── commands/              # loyiha slash-buyruqlari
│   ├── verify.md          # /verify
│   └── scaffold.md        # /scaffold <EntityName>
├── agents/                # loyiha subagentlari
│   ├── lead.md            # tahlil qiladi, bo'laklarga ajratadi, yo'naltiradi
│   ├── back.md            # backend logikasini yozadi
│   └── tester.md          # test yozadi
└── hooks/
    └── format.mjs         # PostToolUse: prettier
```

## settings.json

**Permissions.** `allow` ro'yxatida bu loyihada tez-tez takrorlanadigan xavfsiz buyruqlar: `npm run *`, `npx tsc/swc/prettier`, git'ning o'qish buyruqlari, Mongo konteynerini boshqarish. Ular uchun ruxsat so'ralmaydi.

`deny` ro'yxatida:
- `Read(./.env.prod)` — prod maxfiy ma'lumotlari. **Diqqat:** bu Read tool'ini to'sadi, lekin `cat .env.prod` kabi shell orqali o'qishni emas — bu qalqon emas, ehtiyot chorasi.
- `git push --force` / `-f` — tarixni qayta yozishni tasodifan bajarmaslik uchun.

**Hook.** `PostToolUse` `Write|Edit` da `format.mjs` ishga tushadi va yozilgan faylni loyihaning `.prettierrc.json` sozlamalari bilan formatlaydi (4 space, single quotes, printWidth 100). Shu tufayli formatlash uchun alohida qadam kerak emas.

`format.mjs` xususiyatlari:
- **Hech qachon bloklamaydi** — buzuq JSON, yo'q fayl, o'rnatilmagan prettier: har holatda `exit 0`.
- **Faqat loyiha ichi** — tashqaridagi fayllarga tegmaydi.
- **npx emas** — lokal `node_modules/prettier/bin/prettier.cjs` to'g'ridan-to'g'ri chaqiriladi, har tahrirda ~1 soniya tejaladi.

`jq` ishlatilmagan (bu mashinada o'rnatilmagan) — hook Node bilan yozilgan, ya'ni qo'shimcha bog'liqliksiz ishlaydi.

## Slash-buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `/verify` | Type-check → build → DB bootstrap tartibi → fail-fast → HTTP kontrakti (404/400/500, dev va prod). Skelet holatining kutilgan "g'alatiliklari" ham hujjatlangan. |
| `/scaffold <EntityName>` | Yangi entity uchun 6 qatlam + barrel eksportlari + `server.ts` da ro'yxatdan o'tkazish. Konvensiyalar (204 ishlatmaslik, `{new: true}`, alias'larni uch joyda e'lon qilish) buyruq ichida yozilgan. |

## settings.local.json

Shaxsiy sozlamalar uchun (gitignore qilingan). Masalan `defaultMode`, o'zingizga xos permission'lar. Yuklanish tartibi: user → project → local, keyingisi avvalgisini ustidan yozadi.

## Agentlar

| Agent | Vazifasi | Tools |
|---|---|---|
| `lead` | Topshiriqni tahlil qiladi, bo'laklarga ajratadi, `back`/`tester` ga yo'naltiradi, natijani mustaqil tekshiradi. | `Read, Glob, Grep, Bash, Agent` |
| `back` | Qatlamli struktura asosida backend logikasi: service, controller, router, model, DTO. | `Read, Write, Edit, Bash, Glob, Grep` |
| `tester` | Service unit testlari, middleware testlari, supertest orqali route integratsiya testlari. | `Read, Write, Edit, Bash, Glob, Grep` |

Uchalasi ham `model: inherit` — asosiy sessiya modelidan meros oladi.

### Ish oqimi

```
topshiriq → lead → tahlil → bo'laklar (fayl egaligi bilan)
                              ├── back    (logika)
                              └── tester  (test, back'dan keyin)
                          → lead verifikatsiya qiladi → hisobot
```

`lead` da **`Write`/`Edit` ataylab yo'q** — u kod yozmaydi, faqat yo'naltiradi va tekshiradi. Bu uning rolini aniq qiladi.

### Mas'uliyat chegaralari

- `back` logika yozadi, test yozmaydi. `tester` test yozadi, logikani "tuzatmaydi" — yiqilgan test haqiqiy bugni ko'rsatsa, xabar beradi.
- `lead` faqat `back`, `tester` va `Explore` ga yo'naltiradi. Tooling, Docker, CI, hujjatlar, dependency, git — bular agentlarga emas, asosiy sessiyaga qaytariladi.
- Hech biri `PROGRESS.md` ga yozmaydi — jurnalni asosiy sessiya yuritadi, parallel yozuv konfliktga olib keladi.

### `lead` promptiga kodlashtirilgan tajriba

Bu qoidalar shu loyihada amalda o'rganilgan:

- **Fayl egaligi.** Parallel agentlar hech qachon bir faylga tegmasin; ishga tushirishdan oldin ro'yxatlar solishtiriladi. Agentga boshqasi hali tugatmagan fayldagi o'tkinchi `type-check` xatosi haqida oldindan aytiladi, aks holda u "tuzatishga" urinadi.
- **Keng ta'sirli o'zgarish oxirida, yakka.** Masalan `tsconfig.json` qat'iyligini oshirish.
- **Agent hisoboti dalil emas.** Bir agent xato-ishlovchini "tuzatdim" dedi va `type-check` toza edi, lekin dev rejimida haqiqiy xato xabari o'rniga generic matn qaytarardi — buni faqat endpoint'ni haqiqatan chaqirib ko'rish aniqladi. Shuning uchun `lead` har doim o'zi tekshiradi.

### `tester` infratuzilmasi

Avval `tester` uchun hech qanday sharoit yo'q edi — framework o'rnatilmagan, `.env.test` yo'q, dekorator metadatasi ishlamasdi. Endi hammasi tayyor va `npm test` ishlaydi; agent faqat test yozadi, muhitni qurmaydi.

| Fayl | Vazifasi |
|---|---|
| `vitest.config.mts` | swc transform (dekorator metadatasi), alias'lar, setup fayllari, coverage |
| `test/global-setup.ts` | butun run uchun **bitta** `mongodb-memory-server` |
| `test/setup.ts` | har worker'da `@config` import'idan **oldin** `NODE_ENV`/`DB_*` ni qo'yadi |
| `test/helpers/` | `createTestApp`, `connectTestDb`, `clearTestDb`, `disconnectTestDb` |
| `test/infrastructure.test.ts` | muhitning o'zini tekshiradi (domenga bog'liq emas) |
| `.env.test`, `tsconfig.test.json` | commit qilinadi; `.gitignore` da `!/.env.test` istisnosi |

Hal qilingan uchta to'siq:

1. **Framework yo'q edi** → Vitest + supertest + mongodb-memory-server + `@vitest/coverage-v8`.
2. **`NODE_ENV=test` da env validatsiyasi `process.exit(1)` qilardi** (`.env.test` yo'q edi) → `.env.test` commit qilindi va `test/setup.ts` in-memory DB qiymatlarini `@config` import'idan oldin qo'yadi. dotenv mavjud `process.env` o'zgaruvchisini almashtirmaydi, shuning uchun ular ustun turadi.
3. **esbuild `emitDecoratorMetadata` ni qo'llab-quvvatlamaydi** (typedi + class-validator sinardi) → `unplugin-swc` mavjud `.swcrc` ni qayta ishlatadi, faqat module turi ESM ga o'zgaradi. `test/infrastructure.test.ts` buni konstruktor inyeksiyasi orqali **isbotlaydi**.

Nozik joy: `test/setup.ts` da top-level `await` ishlatmang — `module: commonjs` da `tsc` dan o'tmaydi. Async ish `global-setup.ts` ga tegishli.

## Ataylab qo'shilmagan

- **`skills/`** — `CLAUDE.md` + ikkita slash-buyruq hozirgi ehtiyojni qoplaydi. Skill qo'shish faqat takrorlanuvchi, ko'p qadamli ish paydo bo'lganda ma'noga ega.
- **Type-check hook'i** — har tahrirda `tsc` ishga tushirish sekin (bir necha soniya). Uning o'rniga `/verify` yoki commit oldidan husky ishlatilsin.
