# Test infratuzilmasi

Kim o'qiydi: **`tester` agenti** va testga tegadigan har qanday ish. Umumiy kontekst (skelet holati, arxitektura oqimi) [`CLAUDE.md`](../CLAUDE.md) da.

**Vitest + supertest + mongodb-memory-server.** Infratuzilma tayyor va ishlaydi — `npm test`. Uni qayta qurmang, dependency qo'shmang, konfiguratsiyani o'zgartirmang.

```
test/
├── global-setup.ts        # butun run uchun BITTA in-memory mongod
├── setup.ts               # har worker'da env'ni @config import'idan oldin to'g'rilaydi
├── helpers/               # createTestApp, connectTestDb, clearTestDb, disconnectTestDb
└── infrastructure.test.ts # muhitning o'zini tekshiradi (domenga bog'liq emas)
```

Test fayllari `test/` ichida, `*.test.ts`. Alias'lar u yerda ham ishlaydi (Vite `resolve.tsconfigPaths` + `tsconfig.test.json`).

## Buyruqlar

| Buyruq                  | Izoh                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `npm test`              | Vitest, bir marta                                              |
| `npm run test:watch`    | Vitest watch rejimida                                          |
| `npm run test:coverage` | v8 coverage → `coverage/`                                      |
| `npm run type-check`    | `tsc --noEmit` (src) **va** `tsc -p tsconfig.test.json` (test) |

## Bilish kerak bo'lgan uchta nozik joy

1. **env `process.exit(1)` xavfi.** `env.config.ts` modul yuklanganda validatsiya qiladi; xato bo'lsa jarayon **jim o'ladi**. `test/setup.ts` `process.env` ni oldindan to'ldiradi (dotenv mavjud o'zgaruvchini almashtirmaydi, shuning uchun in-memory DB qiymatlari ustun turadi). `.env.test` commit qilingan — `.gitignore` da `!/.env.test` istisnosi bor.
2. **Dekorator metadatasi.** Vitest'ning default esbuild transformeri `emitDecoratorMetadata` ni qo'llab-quvvatlamaydi, loyiha esa typedi va class-validator dekoratorlariga tayanadi. `unplugin-swc` mavjud `.swcrc` ni qayta ishlatadi — build bilan test o'rtasida farq yo'q.
3. **`test/setup.ts` da top-level `await` ishlatmang** — `module: node16` (CommonJS emit) da `tsc` dan o'tmaydi. Async ish `global-setup.ts` ga tegishli.

Qo'shimcha: har worker o'z bazasida ishlaydi (`test_<pid>`), shuning uchun `clearTestDb()` qo'shni test faylini buzmaydi.

## Integratsiya testi shakli

Integratsiya testida `app.listen()` chaqirmang: `createTestApp([new SomeRouter()])` → `supertest(app)`. To'liq app orqali o'tish shart, chunki `res.success()` va 404/error kontrakti middleware'larda yig'iladi. Faqat service'ni test qilayotgan bo'lsangiz app kerak emas — `connectTestDb()` yetadi.

## Lint va testlar

`no-unsafe-*` oilasi `test/` da o'chirilgan: `supertest` javobining `body` tipi `any` (`@types/superagent`) — bu kutubxona chegarasi, bizning kodimiz emas. `src/` da qoida kuchida.
