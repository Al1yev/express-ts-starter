# PROGRESS

Bajarilgan ishlar jurnali. Yangi yozuvlar tepaga qo'shiladi. **Har bajarilgan ishdan keyin yozuv qo'shiladi** — asosiy sessiya tomonidan, subagentlar emas.

---

## 2026-08-31 — GitHub'ga push oldidan `.gitignore` kengaytirildi

**Maqsad:** repo'ni ochiq GitHub'ga chiqarishdan oldin maxfiy fayllar tasodifan commit bo'lib qolmasligini kafolatlash.

**Avval audit qilindi (topilma: sirlar oqmagan):**

- Tracked fayllarda haqiqiy sir yo'q. `git grep` topgan `super-secret-parol` — `test/error.middleware.test.ts` dagi ataylab qo'yilgan fixture (xato maskalash testi), `password` esa `docs/backend.md` va `user.model.ts` dagi izohlar.
- Tarixda `.env` bir marta commit qilingan (`9f74893`, keyin `3125862` da o'chirilgan), lekin ichida faqat `PORT=5000` bo'lgan — **tarixni qayta yozish shart emas**.
- `.env.dev` va `.env.prod` allaqachon ignore holatida edi.

**O'zgargan fayl:** `.gitignore` — qayta tuzildi va quyidagilar qo'shildi:

- **Ichki papkalardagi env fayllar.** Avvalgi `/.env*` faqat root'ga tegishli edi, ya'ni `src/.env` yoki `config/.env.local` ignore qilinmasdi. Endi anchor'siz `.env` / `.env.*` qoidalari ham bor, `!/.env.example` va `!/.env.test` istisnolari esa ulardan **keyin** turadi (git'da oxirgi mos qoida yutadi).
- **Kalit va hisob ma'lumotlari:** `*.pem`, `*.key`, `*.crt`, `*.p12`, `*.pfx`, `*.jks`, `id_rsa*`, `id_ed25519*`, `.npmrc` (npm auth token shu yerda turadi), `.netrc`, `credentials.json`, `service-account*.json`, `secrets.json`, `*.kubeconfig`.
- **Build/log/tmp:** `/build`, `*.tsbuildinfo`, `*.log` va paket menejeri debug loglari, `/logs`, `/tmp`, `/.tmp`, `/.cache`.
- **Deploy artefaktlari:** `/.vercel`, `/.serverless`, `/.terraform`, `*.tfstate*`.
- **OS/muharrir:** `.DS_Store`, `Thumbs.db`, `desktop.ini`, `/.idea`, `/.vscode`, `*.swp`, `*~`.
- **Claude Code:** mavjud `.claude/settings.local.json` ga `.claude/*.local.json` qo'shildi. `.claude/settings.json` (jamoa uchun umumiy: permission'lar va format hook'i) commit qilinaveradi.

**Verifikatsiya:**

- `git check-ignore -v` — `.env.dev`, `.env.prod`, `src/.env`, `config/.env.local`, `certs/server.key`, `deploy/id_rsa` ignore qilinadi; `.env.example` va `.env.test` esa **ignore qilinmaydi** (istisnolar buzilmagan).
- `git ls-files | git check-ignore --stdin` — bo'sh: hozir tracked bo'lgan birorta fayl yangi qoidalar ostida qolib ketmadi.

---

## 2026-08-31 — Struktura auditidagi barcha nomuvofiqliklar tuzatildi

**Maqsad:** oldingi yozuvdagi P1–P4 topilmalarini yopish. Ikkala ochiq savolga foydalanuvchi javob berdi: `abstract.model.ts` o'chiriladi, `Routes.path` tiriltiriladi.

### P1 — `Routes.path` tiriltirildi

`src/interfaces/router.interface.ts` — `path?: string` → **`path: string`** (majburiy). Ixtiyoriy bo'lganda uni unutish jimgina `/` ga o'rnatilishga olib kelardi; majburiy qilish bu xatoni kompilyatsiya vaqtida ushlaydi.

`src/app.ts:57` — `this.app.use('/', route.router)` → `this.app.use(route.path, route.router)`.

Prefiks endi **bitta joyda** qo'yiladi, shuning uchun router'lardan ichki `${this.path}` takrori olib tashlandi:

- `src/routers/user.router.ts` — `/users` → `'/'`, `/users/:id` → `'/:id'`
- `src/routers/health.router.ts` — `/health` → `'/'`
- `test/infrastructure.test.ts` — `ProbeRouter` yo'llari prefikssiz
- `test/error.middleware.test.ts` — `ErrorProbeRouter` da `path` umuman yo'q edi (shuning uchun tip xatosi berdi); `path = '/err'` qo'shildi va yo'llardan `/err` prefiksi olib tashlandi

Tashqi URL'lar **o'zgarmadi** — 58 ta test ham o'zgartirilmagan tasdiqlar bilan o'tdi.

### P1 — `src/models/abstract.model.ts` o'chirildi

0 baytli, hech kim import qilmagan, barrel'da yo'q edi. `git rm`.

### P2 — `database` konvensiyaga qaytarildi

`src/database/index.ts` → `src/database/mongo.database.ts` (`git mv`), barrel esa bir qatorga aylandi: `export { dbConnection, isDbConnected } from './mongo.database';`

Uch narsa tuzaldi: `camelCase.<layer>.ts` konvensiyasi tiklandi, `@database/*` subpath'i endi haqiqiy faylga olib boradi, va eng muhimi — `vitest.config.mts:39` dagi `coverage.exclude: ['src/**/index.ts']` endi bu jonli logikani **chiqarib tashlamaydi**. `test/helpers/db.helper.ts` dagi `from '@database'` import'i o'zgarmadi.

### P3 — controller ↔ model tip chegarasi

`src/controllers/user.controller.ts` dan `import { UserDocument } from '@models'` olib tashlandi; uchala metod endi `User` ishlatadi (`findAllUsersData` allaqachon shunday edi — fayl ichidagi ikkixillik ham yo'qoldi).

**Qabul qilingan qoida:** mongoose tipi **service qatlamida to'xtaydi**. `UserService` hamon `UserDocument` qaytaradi (service → model qo'shnichiligi qonuniy), lekin `HydratedDocument<User>` `User` ga tayinlanadi, shuning uchun service keyinchalik `.lean()` ga o'tsa yoki DTO qaytara boshlasa controller o'zgarmaydi. Aynan shu sinishdan qochish uchun qilindi.

### P4 — mayda tozalash

- `tsconfig.json:52` — `include` dan `".env"` olib tashlandi (TS fayl emas, ta'sirsiz qoldiq)
- `src/middlewares/index.ts`, `src/routers/index.ts` — eksportlar alifbo tartibiga solindi

### Hujjatlar

- `docs/structure.md` — "Router prefiksi — kim qo'yadi" bo'limi kod misoli bilan qo'shildi; alias bo'limiga "to'rtinchi joy yo'q" izohi kiritildi (`vitest` `tsconfigPaths: true` orqali, `tsc-alias` va `tsx` ham `tsconfig.json` dan oladi — yagona qo'lda saqlanadigan nusxa `.swcrc`)
- `docs/backend.md` — yangi "Qatlam chegaralari" bo'limi: controller `@models` dan import qilmaydi; DI faqat service qatlamida
- `.claude/commands/scaffold.md` — router qadamiga `path` majburiyligi va prefikssiz yo'llar qoidasi; konvensiyalarga controller/model chegarasi

**Verifikatsiya:** `npm run type-check` ✅ (`tsc --noEmit` + `tsconfig.test.json`), `npm test` ✅ 4 fayl / 58 test, `npm run lint` ✅ toza.

---

## 2026-08-31 — `arch` agenti bilan birinchi struktura auditi

**Maqsad:** yangi qo'shilgan `arch` agentini haqiqiy vazifada sinash va loyihaning strukturaviy holatiga baho olish. **Kod o'zgartirilmadi** — bu faqat audit yozuvi; tavsiyalar hali bajarilmagan.

**Toza chiqqan tekshiruvlar:** 11/11 papkada `index.ts` bor; `tsconfig.json` ↔ `.swcrc` alias'lari bayt-ma-bayt bir xil (23 yozuv); ikkala router ham `server.ts` da ro'yxatdan o'tgan; `src/` va `test/` da papkalararo `../` import yo'q; nomlash (`name.<layer>.ts`, PascalCase klasslar) izchil.

**Aniqlangan nomuvofiqliklar:**

| Prioritet | Joy                                    | Muammo                                                                                                                                                                                                               |
| --------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1        | `src/app.ts:56-60`                     | `route.path` hech qachon o'qilmaydi — `this.app.use('/', route.router)`. `Routes.path?` o'lik kontrakt: yangi router muallifi `path` ga suyansa, endpoint jimgina `/` ga tushadi                                     |
| P1        | `src/models/abstract.model.ts`         | 0 baytli, hech kim import qilmaydi, barrel'da yo'q — `14af7eb` dan qolgan                                                                                                                                            |
| P2        | `src/database/index.ts`                | Yagona barrel-ichida-implementatsiya; `<name>.database.ts` yo'q, `@database/*` subpath bo'sh, va `vitest.config.mts:39` dagi `coverage.exclude: ['src/**/index.ts']` tufayli jonli logika coverage'dan chiqib ketgan |
| P3        | `src/controllers/user.controller.ts:5` | Controller `@models` dan `UserDocument` import qiladi; bir fayl ichida `User[]` va `UserDocument` aralash                                                                                                            |
| P4        | `tsconfig.json:52`                     | `include` da `".env"` — qoldiq, ta'sirsiz                                                                                                                                                                            |

**Aniqlangan fakt:** alias'ning "uchinchi joyi" yo'q. `vitest.config.mts:15` da `resolve: { tsconfigPaths: true }` (Vite 8.2.2 qo'llab-quvvatlaydi), `build:tsc` → `tsc-alias`, `dev` → `tsx` — hammasi `tsconfig.json` ni o'qiydi. Haqiqiy manba **ikkita**: `tsconfig.json` va `.swcrc`. `CLAUDE.md` va `docs/structure.md` dagi "uch joy" formulasi aniqlashtirilishi kerak.

**Ochiq savollar (foydalanuvchi qarori kutilmoqda):**

1. `abstract.model.ts` — kelajak uchun rejami yoki qoldiqmi?
2. `Routes.path` tiriltirilsinmi (`app.ts` + barcha router'lar tegadi), yoki hujjatda "router o'z prefiksini ichkarida qo'yadi" deb qotirilsinmi?

**Verifikatsiya:** o'zgarish bo'lmagani uchun `type-check`/`test` ishga tushirilmadi.

---

## 2026-08-31 — `arch` agenti va kontekstni mavzu bo'yicha ajratish

**Maqsad:** (1) "yangi narsa qayerga tegishli" degan savolga javob beradigan agent yo'q edi; (2) `CLAUDE.md` har sessiyaga **va har bir subagent chaqiruviga** avtomatik yuklanadi, shuning uchun undagi har ortiqcha qator har chaqiruvda token sarflardi.

### 1. `arch` agenti qo'shildi

`.claude/agents/arch.md` — `model: opus`, `tools: Read, Glob, Grep, Bash`.

`lead` da bo'lgani kabi **`Write`/`Edit` ataylab yo'q**: agent qaror qaytaradi, amalni `back` yoki asosiy sessiya bajaradi. Bu roli aniq qiladi va `back` bilan fayl konfliktini yo'qotadi — aks holda ikkalasi bir vaqtda `index.ts` ga yozardi.

Nima qiladi:

- **Joylashuv qarori** — yangi fayl/papka uchun aniq yo'l, nom, barrel qatori, alias qatorlari (uch joy), `app.ts`/`server.ts` dagi ulash nuqtasi
- **Drift auditi** — beshta tekshiruv: har papkada `index.ts` bormi; har fayl barrel'da eksportmi; `tsconfig.json` ↔ `.swcrc` alias'lari mosmi; har router `server.ts` da ro'yxatdanmi; `src/` da papkalararo `../` import bormi

**Nega kerak edi:** `/scaffold` strukturaviy ulash qoidalarini faqat **yangi entity** uchun qoplaydi. Entity bo'lmagan qo'shimchalar — middleware, util, config, `jobs/` kabi cross-cutting papka — hech kimning mas'uliyatida emas edi.

**Qabul qilingan qarorlar:**

- Yangi papka uchun **yuqori bo'sag'a**: bu boilerplate, har qatlam undan yaratiladigan barcha loyihalarga meros bo'ladi. Kamida ikkita foydalanuvchi bo'lmasa — mavjud papkaga joylashtiriladi.
- Auditi **faqat struktura** bilan cheklangan; tiplar, build va HTTP kontrakti `/verify` da qoladi — takrorlanmaydi.
- Promptga "bular drift emas" ro'yxati kiritildi (skelet servislar, bo'sh DTO), aks holda agent birinchi auditda yolg'on xato berardi.

`lead.md` yangilandi: yo'naltirish jadvaliga `arch` qo'shildi ("uchtasidan" → "to'rttasidan") va qoida kiritildi — joylashuv noaniq bo'lsa `back` dan **oldin** `arch` dan so'raladi.

### 2. Kontekst mavzu bo'yicha ajratildi

`CLAUDE.md` **136 → 50 qator**. Qolgani to'rtta faylga chiqarildi:

| Fayl                | Qator | Kim o'qiydi    | Nima ko'chdi                                                                                                                    |
| ------------------- | ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docs/backend.md`   | 66    | `back`         | Konvensiyalar, xato maskalash, validatsiya + bo'sh DTO g'alatiligi, env, `/health`, mongoose tuzoqlari, skelet `eslint-disable` |
| `docs/structure.md` | 65    | `arch`         | Papka kartasi, alias'lar (uch joy), ulash nuqtalari, nom konvensiyalari                                                         |
| `docs/testing.md`   | 40    | `tester`       | Test infratuzilmasi, uchta nozik joy, integratsiya shakli, test lint qoidasi                                                    |
| `docs/tooling.md`   | 43    | asosiy sessiya | Script'lar jadvali, husky hook'lari, ESLint konfiguratsiyasi                                                                    |

`CLAUDE.md` da qolgani: skelet holati, arxitektura oqimi, to'rtta buzilmaydigan qoida va "qayerda nima yozilgan" jadvali.

**Faqat `CLAUDE.md` ni bo'lish yetarli emas edi** — agent promptlarining o'zi ham xuddi shu ma'lumotni takrorlab turgan edi. Shuning uchun:

- `back.md` — konvensiyalar bloki 24 qatordan 7 qatorlik eslatma ro'yxatiga
- `tester.md` — infratuzilma jadvali + "nega shunday qurilgan" bo'limi 3 qatorlik havolaga
- `arch.md` — papka kartasi va nomlash jadvallari `docs/structure.md` ga havolaga

Har fakt endi **aynan bitta faylda** turadi. Har agent promptida "o'z faylingni o'qi, boshqalarnikini o'qima" ko'rsatmasi bor.

### 3. Verifikatsiya

- Eski `CLAUDE.md` ning 12 ta kalit fakti (`forbidUnknownValues`, `runValidators`, `projectService`, `emitDecoratorMetadata`, `pre-push`, `z.infer` va h.k.) yangi fayllarda topildi — hech biri yo'qolmadi.
- `arch` promptidagi beshta audit buyrug'i **haqiqatan ishga tushirildi**: 11 papkada `index.ts` bor, `tsconfig.json` ↔ `.swcrc` alias'lari aynan mos (diff bo'sh), ikkala router `src/server.ts:7` da ro'yxatda, `src/` da papkalararo `../` import yo'q.
- Barcha nisbiy havolalar mavjud fayllarga boradi.
- `npx prettier --check .` toza (pre-commit hook'dan o'tadi). `src/` ga tegilmadi.

### 4. Qabul qilingan ish tartibi

- **Har bajarilgan ishdan keyin `PROGRESS.md` ga yozuv qo'shiladi** — alohida so'ralishini kutmasdan.
- **`CLAUDE.md` faqat yadro bo'lib qoladi.** Yangi ma'lumot yozishdan oldin savol: buni hamma o'qishi kerakmi? Yo'q bo'lsa — tegishli `docs/` fayliga.

---

## 2026-08-29 — Tooling muammolarini ketma-ket tuzatish

`CLAUDE.md` dagi "ma'lum tooling muammolari" ro'yxati hajmi bo'yicha tartiblanib, kichigidan boshlab bajarildi. Har bir bosqich alohida commit.

### 1-3. `package.json` metama'lumotlari va script'lari

| #   | Muammo                                                                             | O'zgarish                                             |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | `main` → `dist/server.js`, lekin swc `dist/src/` ga chiqaradi                      | `main` → `dist/src/server.js`                         |
| 2   | `build` da `-d dist/test` va `--out-dir dist` bir vaqtda — `-d` o'lik argument edi | `swc ./src --source-maps --copy-files --out-dir dist` |
| 3   | `rimraf` `dependencies` da turardi, faqat `clean` script'i uchun kerak             | `devDependencies` ga ko'chirildi                      |

**Tekshirildi:** `npm run clean` → `npm run build` → 28 fayl kompilyatsiya bo'ldi; `main` ko'rsatgan `dist/src/server.js` haqiqatan mavjud; `dist/test` papkasi endi umuman yaratilmaydi. `main` va `start` endi bir xil yo'lni ko'rsatadi.

---

### 4. `.gitattributes` — satr oxirlari

**Muammo:** `.prettierrc.json` da `endOfLine: "lf"`, lekin `git config core.autocrlf=true` checkout paytida fayllarni CRLF ga aylantirardi. Natijada `npx prettier --check .` **doim qizil** edi — 38 fayl, farq esa faqat satr oxirida.

**Yechim:** `.gitattributes` → `* text=auto eol=lf`. U `core.autocrlf` dan ustun turadi.

Ikkita nozik joy:

- **Mazmun diff'i chiqmadi.** `git add --renormalize .` hech narsa ko'rsatmadi, chunki git'da saqlangan mazmun allaqachon LF edi (`core.autocrlf` commit paytida normalizatsiya qilardi). O'zgargan narsa faqat checkout xulqi.
- **`git checkout-index -a -f` ishlamadi** — git fayllarni o'zgarmagan deb hisoblab, qayta yozmadi. Working tree'ni yangilash uchun `git rm --cached -r . && git reset --hard` kerak bo'ldi.

**Ostidan chiqqan haqiqiy muammo.** Shovqin ketgach `prettier --check` 38 dan **7 taga** tushdi va bu 7 tasi haqiqiy formatlash xatolari edi. Hammasi Bash heredoc bilan yozilgan fayllar — `PostToolUse` prettier hook'i faqat `Write`/`Edit` tool'larida ishga tushadi, shell orqali yozishni ushlamaydi. (Buni tasdiqlovchi dalil: `Write` bilan yozilgan `.claude/agents/tester.md` ro'yxatda yo'q edi.) `npm run format` bilan tuzatildi.

**Natija:** `npx prettier --check .` → `All matched files use Prettier code style!`, exit 0. `npm run type-check` exit 0, `npm test` 55/55.

---

### 5. Ortiqcha dependency'lar olib tashlandi

`nodemon`, `ts-node`, `ts-node-dev` — uchalasi ham hech qayerda ishlatilmasdi (`tsx` yetarli). Tekshirildi: `nodemon.json` yo'q, kod va config'larda birorta havola yo'q, `npm ls` ga ko'ra ularga faqat bir-biri bog'liq edi (`ts-node-dev` → `ts-node`).

`node_modules`: **404 → 372** paket.

**Tekshirildi:** `npm run type-check` exit 0, `npm test` 55/55, `npm run build` 28 fayl, `npm run build:tsc` exit 0.

**Yo'l-yo'lakay topilgan yangi nomuvofiqlik.** `build` (swc) `dist/src/` ga chiqaradi, `build:tsc` esa (`tsc` + `tsc-alias`) `dist/` ildiziga — ya'ni `dist/server.js`. `main` va `start` `dist/src/server.js` ni ko'rsatadi, demak `build:tsc` chiqishi ular uchun **topilmaydi**. Bu yangi ro'yxatga qo'shildi, tuzatilmadi.

---

### 6. `/health` readiness probe'ga aylantirildi

**Muammo:** endpoint DB holatini umuman o'qimasdi — Mongo o'lgan bo'lsa ham `200 ok` qaytarardi, ya'ni orkestrator uchun yolg'on signal edi.

**O'zgarish:**

| Fayl                           | Nima                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `src/database/index.ts`        | `isDbConnected()` qo'shildi — `connection.readyState === 1`                                                   |
| `src/routers/health.router.ts` | Ulanish yo'q bo'lsa `HttpException(503, 'Database unavailable')`; muvaffaqiyatda javobga `db: 'up'` qo'shildi |
| `test/health.router.test.ts`   | Uzilgan holat uchun 2 ta test                                                                                 |

**Qaror:** `readyState` router'dan emas, `@database` dan o'qiladi — ulanish holati o'sha modulning mas'uliyati, router'lar mongoose'ga to'g'ridan-to'g'ri tegmasligi kerak.

**Testda mock ishlatilmadi.** Uzilgan holat haqiqiy `mongoose.disconnect()` bilan sinaladi, `afterAll` da `connectTestDb()` qaytaradi. Readiness probe'ning butun ma'nosi mongoose'ning haqiqiy holatini aks ettirishida — mock qo'yilsa test o'z soxta holatiga bog'lanib qolardi.

**Mutatsiya bilan tekshirildi:** guard vaqtincha olib tashlanganda ikkala yangi test ham kutilgan sababdan yiqildi (`2 failed | 8 passed`), ya'ni ular bo'sh o'tmaydi.

**Jonli sikl (Mongo konteyneri bilan):**

| Bosqich              | Natija                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| Mongo yoqiq          | `200` — `{"status":"ok","db":"up","uptime":3.6,"env":"dev"}`              |
| `docker stop mongo`  | `503` — `{"success":false,"message":"Database unavailable","data":null}`  |
| `docker start mongo` | `200` — o'sha jarayon, uptime uzluksiz 31.9s (mongoose o'zi qayta ulandi) |

**Bilib qo'yish kerak:** prod'da `ErrorMiddleware` har qanday 5xx ni `'Internal server error'` ga aylantiradi, shu jumladan bu `503` ni ham. **Status kodi saqlanadi**, ya'ni orkestrator uchun muammo yo'q, lekin javobdan sabab ko'rinmaydi. Bu quyidagi 7-raqamli ochiq savolga borib taqaladi.

**Tekshirildi:** `npm run type-check` exit 0, `npm test` **57/57**, shuffle ikki urug'da barqaror, `prettier --check` toza.

---

### 7. `build:tsc` ham `dist/src/` ga chiqaradigan qilindi

**Muammo:** `build` (swc) `dist/src/` ga, `build:tsc` (`tsc` + `tsc-alias`) esa `dist/` ildiziga chiqarardi. `main` va `start` `dist/src/server.js` ni ko'rsatgani uchun `build:tsc` chiqishi ular uchun **topilmasdi**.

**O'zgarish:** `tsconfig.json` da `outDir: "dist"` → `"dist/src"`. `rootDir: "src"` o'zgarmadi.

**Tekshirildi:** `npm run build:tsc` endi `dist/src/` ga chiqaradi; `tsc-alias` alias'larni to'g'ri hal qildi (`dist/src/` da birorta `require("@...")` qolmadi); kompilyatsiya qilingan server `node dist/src/server.js` bilan ko'tarildi va `GET /health` → `200` qaytardi. `npm run type-check` exit 0, `npm test` 57/57.

---

### 8. `ErrorMiddleware`: `HttpException` xabari endi maskalanmaydi

**Muammo:** maskalash sharti `status >= 500` edi, ya'ni **ataylab** tashlangan `HttpException(503, 'To'lov provayderi javob bermadi')` xabari ham prod'da `'Internal server error'` ga aylanardi. `CLAUDE.md` esa "`HttpException` — operatsion xato, `status` va `message` client'ga boradi" deb yozilgan edi — kod hujjatga zid edi.

**O'zgarish:** shart `status >= 500` → `!isHttpException`.

```ts
const clientMessage =
    !isHttpException && env.NODE_ENV === 'prod' ? 'Internal server error' : message;
```

**Nima o'zgarmadi:** kutilmagan xatolar prod'da hamon maskalanadi. Ular ichki tafsilot (DB ulanish satri, fayl yo'llari) sizdirishi mumkin, `HttpException` esa dasturchi client uchun ataylab yozgan matn. `status >= 500` tekshiruvi olib tashlandi, chunki u ortiqcha edi — `!isHttpException` bo'lsa status har doim `500`.

**Testlar:** eski xulqni tasdiqlagan test yangi xulqqa moslashtirildi va ikkalasini bir so'rovda taqqoslaydigan yangi test qo'shildi (operatsion 5xx xabari o'tadi, kutilmagan 5xx maskalanadi va `super-secret-parol` javobda yo'q). **Mutatsiya bilan tekshirildi:** eski shart qaytarilganda ikkala test ham yiqildi.

**Yon ta'siri:** `/health` ning `503 Database unavailable` xabari endi prod'da ham client'ga yetib boradi (6-bosqichdagi eslatma o'z kuchini yo'qotdi).

**Diqqat:** endi `HttpException` xabari prod'da to'g'ridan-to'g'ri client'ga boradi — unga maxfiy ma'lumot qo'ymaslik kerak. Bu `CLAUDE.md` ga yozildi.

**Tekshirildi:** `npm run type-check` exit 0, `npm test` **58/58**.

---

### 9. husky ulandi

`husky@9` o'rnatilgan edi, lekin `.husky/` papkasi ham, `prepare` script'i ham yo'q edi — ya'ni hech qanday git hook ishlamasdi.

**Vaqt o'lchandi, keyin qaror qilindi:** `prettier --check .` 5.2s, `type-check` 8.1s, `npm test` 7.8s. Uchalasini `pre-commit` ga qo'yish ~21s bo'lardi — bunday hook `--no-verify` bilan aylanib o'tiladi.

| Hook         | Nima                                        | Vaqt |
| ------------ | ------------------------------------------- | ---- |
| `pre-commit` | `prettier --check .` + `npm run type-check` | ~13s |
| `pre-push`   | `npm test`                                  | ~8s  |

Formatlash tekshiruvi ataylab `pre-commit` da: `.claude/hooks/format.mjs` faqat `Write`/`Edit` tool'larini ushlaydi, shell orqali yozilgan faylni emas — bu 4-bosqichda amalda ko'rilgan (7 ta formatlanmagan fayl aynan shundan chiqqan edi).

**Ikkala bosqich ham haqiqiy sinovdan o'tdi.** `src/utils/__probe.ts` ga tip xatosi qo'yib commit qilishga urinildi:

- prettier bosqichi bloklad: `husky - pre-commit script failed (code 1)` (`husky init` `package.json` formatini buzgan edi)
- format tuzatilgach type-check bloklad: `TS2322: Type 'string' is not assignable to type 'number'` → `code 2`

Ikkala holatda ham commit yaratilmadi. Probe fayli o'chirildi.

---

### 10. ESLint ishlaydigan holatga keltirildi — ro'yxatdagi oxirgi band

`eslint@9` o'rnatilgan edi, lekin config eski `.eslintrc.json` formatida — `npx eslint .` "couldn't find eslint.config.js" bilan **jimgina yiqilardi**. Ya'ni loyihada statik tahlil umuman yo'q edi.

**Qaror:** tip-aware lint (`recommendedTypeChecked`), chunki sintaksis darajasidagi tekshiruv `no-floating-promises` kabi haqiqiy buglarni ko'rmaydi.

**Dependency'lar:** `+typescript-eslint`, `+@eslint/js`, `+globals`; `-@typescript-eslint/parser`, `-@typescript-eslint/eslint-plugin` (meta-paket qamraydi). `.eslintrc.json` o'chirildi. Script'lar: `lint`, `lint:fix` (hook'ga qo'shilmadi — `pre-commit` allaqachon ~13s).

**`@eslint/js` ni pin qilish kerak bo'ldi.** Oxirgi versiyasi 10.x va u `eslint@^10` talab qiladi, bizda esa 9.29 — `npm install` `ERESOLVE` bilan yiqildi. `@eslint/js@^9.29.0` bilan hal bo'ldi. Major versiya `eslint` bilan bir xil bo'lishi shart.

**O'lchov birinchi, sozlash keyin.** Sozlamasiz config bilan `npx eslint . -f json` ishlatilib, xatolar qoida va zona bo'yicha sanaldi: **62 ta** (`src` 29, `test` 33). Taqsimot:

| Qoida                           | src | test |
| ------------------------------- | --- | ---- |
| `no-unsafe-member-access`       | 2   | 24   |
| `no-unused-vars`                | 7   | 0    |
| `require-await`                 | 6   | 0    |
| `no-unsafe-argument`            | 3   | 3    |
| `no-unsafe-enum-comparison`     | 1   | 4    |
| `no-unsafe-assignment`          | 3   | 1    |
| `no-explicit-any`               | 4   | 0    |
| `no-floating-promises`          | 2   | 0    |
| `no-namespace`                  | 1   | 0    |
| `no-unnecessary-type-assertion` | 0   | 1    |

`no-unsafe-*` oilasi jami 40 ta va uning **80% i testlarda** — manba `@types/superagent` dagi `body: any`, bizning kodimiz emas.

**Sozlash — global emas, nishonli.** `warn` ishlatilmadi: 40 ta doimiy ogohlantirish shovqinga aylanadi va o'qilmay qoladi. Buning o'rniga glob override'lar: `test/**` da `no-unsafe-*` o'chirildi (supertest chegarasi), `validation.middleware.ts` da (class-transformer chegarasi), `controllers/*` da `no-unsafe-assignment` (Express'da `ReqBody = any`).

**Linter topgan HAQIQIY nuqsonlar — hammasi tuzatildi:**

| Fayl                                       | Topilma                                                                                                                    | Tuzatish                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/app.ts`                               | `initializeRouters` `async` deb belgilangan, ichi esa sof sinxron `forEach`, ustiga konstruktordan `await`siz chaqirilardi | `async` olib tashlandi — `no-floating-promises` va `require-await` ikkalasi ham ketdi |
| `src/utils/text.utils.ts`                  | `endPadding` hisoblanardi, lekin hech qayerda ishlatilmasdi                                                                | O'lik qator o'chirildi                                                                |
| `src/database/index.ts` + 3 ta test helper | `connection.readyState === 1` — enum'ni raqam bilan solishtirish                                                           | `ConnectionStates.connected` / `.disconnected`                                        |
| `test/error.middleware.test.ts:21`         | Keraksiz `as`                                                                                                              | `--fix` bilan                                                                         |
| `src/server.ts`                            | `bootstrap()` await'siz (ichida `try/catch` bor, ya'ni xavfsiz)                                                            | `void bootstrap();` — niyat aniq bo'lsin                                              |

`res.success(data: any)` → `data: unknown` ham qilindi: `unknown` parametr sifatida hamma narsani qabul qiladi, shuning uchun 6 ta chaqiruv joyi buzilmadi, `response.middleware.ts` uchun override bloki esa keraksiz bo'ldi.

**Skelet servislar** fayl darajasidagi `eslint-disable` izohi bilan hal qilindi, config'dagi glob override bilan **emas** — override butun service qatlamini doimiy ko'r qilardi, izoh esa implementatsiya yozilganda o'chiriladi. `/scaffold` buyrug'i ham yangilandi, endi generatsiya qilingan service'ga shu izohni qo'shadi.

**Tekshirilgan faktlar** (`node_modules` manbasidan, taxmin emas):

- `projectService: true` bu loyihada **ishlamaydi** — `test/` fayllari parse error beradi (`tsconfig.test.json` nomi standart emas, root config `test/` ni qamramaydi). `allowDefaultProject` ham yaramaydi: glob'da `**` taqiqlangan. Yechim — `project: ['./tsconfig.json', './tsconfig.test.json']`.
- `no-misused-promises` **0 xato**: Express 5 da `RequestHandler` → `void | Promise<void>`. Express 4 da bu qoida barcha `async` handler'larda portlardi.
- `eslint-config-prettier` **kerak emas**: ESLint 9 `recommended` va typescript-eslint `recommendedTypeChecked` da formatlash qoidalari yo'q (v6 da `@stylistic` ga ko'chgan).
- `globals` paketida `vitest` kaliti yo'q va kerak ham emas — `tsconfig.test.json` dagi `types: ["vitest/globals"]` yetadi.

**Natija:** 62 → **0**. `npm run lint` exit 0, birorta warning ham yo'q.

**Mutatsiya bilan tekshirildi:** `src/app.ts` ga `await`siz chaqiruv va ishlatilmagan o'zgaruvchi qo'shilganda lint ikkalasini ham ushladi (`no-floating-promises`, `no-unused-vars`), tiklangandan keyin yana toza.

`CLAUDE.md` dagi "ma'lum tooling muammolari" ro'yxati **butunlay bo'shadi** va olib tashlandi — o'rniga "Lint" bo'limi yozildi.

---

## 2026-08-29 — `tester` agenti uchun test infratuzilmasi

**Maqsad:** avvalgi sessiyada uchta agent (`lead`, `back`, `tester`) yaratilgan edi, lekin `tester` da ishlash uchun **hech qanday sharoit yo'q edi** — framework o'rnatilmagan, `.env.test` yo'q, dekorator metadatasi test runner'da ishlamasdi. Uchala to'siq ham hal qilindi va agentlarning uchalasi ham haqiqiy topshiriq bilan sinovdan o'tkazildi.

### 1. Hal qilingan uchta to'siq

| #   | To'siq                                                                                                                                                                      | Yechim                                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Test framework umuman yo'q edi                                                                                                                                              | Vitest 4 + supertest + mongodb-memory-server + `@vitest/coverage-v8`                                                                                                              |
| 2   | `NODE_ENV=test` da `env.config.ts` `.env.test` ni topolmay `process.exit(1)` qilardi — `@config` ni import qilgan har qanday test **jim o'lardi**                           | `.env.test` yaratildi va commit qilinadigan qilindi (`.gitignore` da `!/.env.test`); `test/setup.ts` `process.env` ni `@config` import'idan **oldin** to'ldiradi                  |
| 3   | Vitest'ning default transformeri (esbuild) `emitDecoratorMetadata` ni qo'llab-quvvatlamaydi; loyiha esa typedi (`@Service()`) va class-validator (`@IsEmail()`) ga tayanadi | `unplugin-swc` mavjud `.swcrc` ni qayta ishlatadi (`legacyDecorator` + `decoratorMetadata`), faqat module turi Vite uchun ESM ga o'zgaradi — build bilan test o'rtasida farq yo'q |

### 2. Yaratilgan fayllar

| Fayl                          | Vazifasi                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `vitest.config.mts`           | swc transform, `resolve.tsconfigPaths`, setup fayllari, coverage                  |
| `test/global-setup.ts`        | butun run uchun **bitta** in-memory mongod; URI `MONGO_TEST_URI` orqali uzatiladi |
| `test/setup.ts`               | har worker'da `NODE_ENV=test` va `DB_HOST`/`DB_PORT`/`DB_NAME` ni qo'yadi         |
| `test/helpers/db.helper.ts`   | `connectTestDb`, `clearTestDb`, `disconnectTestDb`                                |
| `test/helpers/app.helper.ts`  | `createTestApp(routes)` → supertest uchun Express instansiyasi                    |
| `test/infrastructure.test.ts` | muhitning **o'zini** tekshiruvchi 10 ta test (domenga bog'liq emas)               |
| `.env.test`                   | commit qilinadi — testlar har mashinada bir xil ishlashi uchun                    |
| `tsconfig.test.json`          | `test/` ni ham qamraydigan, emit qilmaydigan tsconfig                             |

Script'lar: `test`, `test:watch`, `test:coverage`. `type-check` endi `tsc --noEmit && tsc -p tsconfig.test.json` — test fayllari ham tiplardan o'tadi.

### 3. Qabul qilingan qarorlar

- **URI `process.env` orqali uzatiladi, `provide()` orqali emas.** Vitest'ning `provide`/`inject` mexanizmi faqat test tanasida ochiladi, bizga esa qiymat test faylining **import bosqichidan oldin** kerak (`@config` aynan o'sha paytda validatsiya qiladi). Worker'lar `globalSetup` dan keyin fork qilingani uchun env ularga meros bo'ladi.
- **`test/setup.ts` da top-level `await` yo'q.** `module: commonjs` da `tsc` TS1378 beradi (birinchi urinishda aynan shunday yiqildi). Shuning uchun mongod'ni `global-setup.ts` ko'taradi, `setup.ts` esa faqat sinxron env qo'yadi va URI yo'q bo'lsa aniq xato tashlaydi.
- **Har worker o'z bazasida** (`test_<pid>`) — `clearTestDb()` qo'shni test faylini buzmaydi.
- **`vite-tsconfig-paths` plugini olib tashlandi.** Vite endi `resolve.tsconfigPaths: true` bilan buni o'zi qiladi va plugin deprecation ogohlantirishi chiqarardi. Tekshirildi: alias'lar ham (`@config`, `@routers`, ...), `baseUrl` ga tayangan `from 'middlewares'` ham hal bo'ladi.
- **`vitest.config.ts` → `.mts`.** `type: "module"` bo'lmagan loyihada Vite `.ts` konfigni CJS deb yuklab ogohlantirish berardi. `.mts` — Vite tavsiya qilgan haqiqiy yechim, ogohlantirishni bostirish emas.
- **`infrastructure.test.ts` domendan mustaqil.** O'z probe router/service/DTO sini yaratadi, shuning uchun `UserService` skeletdan implementatsiyaga o'tganda ham o'zgarmaydi. Dekorator metadatasi **konstruktor inyeksiyasi** orqali isbotlanadi — `emitDecoratorMetadata` o'chsa typedi `undefined` uzatadi va test yiqiladi.

### 4. Agentlarni tekshirish

Uchala agent ham haqiqiy topshiriq bilan birma-bir sinovdan o'tkazildi (hisobotga emas, chiqishga ishonildi).

| Agent    | Topshiriq                                                                                                                         | Natija                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `back`   | `src/routers/user.router.ts` dagi alias'siz `from 'middlewares'` import'ini tuzatish + `src/` bo'ylab shunga o'xshashini qidirish | ✅ To'g'ri tuzatdi, ko'lamdan chiqmadi, skeletga tegmadi, `type-check` exit 0                          |
| `tester` | `ErrorMiddleware` (prod maskalash yo'li bilan birga) va `padBoth` uchun test                                                      | ✅ 37 test, ikkala fayl ham 100% qamrov; prod muammosini o'zi hal qildi                                |
| `lead`   | Aralash topshiriq: `GET /health` endpoint'i + integratsiya testi                                                                  | ✅ To'g'ri bo'ldi (`back` → router/barrel/`server.ts`, keyin `tester` → test), natijani o'zi tekshirdi |

**`back` hisobotidagi noto'g'ri da'vo.** Agent "eski import runtime'da `MODULE_NOT_FOUND` berardi" dedi. Tekshirildi — **xato**: o'zgarishdan oldin qurilgan `dist/src/routers/user.router.js` da `require("../middlewares")` turibdi, ya'ni swc `baseUrl` orqali to'g'ri hal qilgan. O'zgarishning o'zi baribir to'g'ri (konvensiya), lekin asoslash noto'g'ri edi. Bu `lead` promptidagi "agent hisoboti dalil emas" qoidasining yana bir tasdig'i.

**`tester` topgan haqiqiy nozik joy.** `vi.mock('@config', ...)` **jimgina ishlamaydi**: haqiqiy import'lardagi alias'ni swc nisbiy yo'lga aylantiradi, `vi.mock()` ning satr argumenti esa o'zgarmaydi va `test/` ichidan hal bo'lmaydi. Vitest ogohlantirish bermaydi — mock e'tiborsiz qoladi va "prod" testlari aslida test muhitida ishlab **yolg'on yashil** bo'lib qolishi mumkin edi. Yechim: modulni nisbiy yo'l bilan ko'rsatish (`vi.mock('../src/config/index.ts', ...)`) va `NODE_ENV` ni getter orqali almashtirish. Sabab test faylining ichida izohda yozib qo'yildi.

**`tester` topgan ayb (tuzatildi).** `test/infrastructure.test.ts` dagi ikkita Mongo testi tartibga bog'liq edi — `Probe` modeli birinchi test ichida ro'yxatdan o'tardi, ikkinchisi esa uni tayyor deb hisoblardi. Model modul darajasiga ko'chirildi; `--sequence.shuffle` uch xil urug' bilan tekshirildi.

**`lead` ning yo'naltirishi.** Topshiriqni to'g'ri ikkiga ajratdi va ketma-ketlikni saqladi (`tester` `back` dan keyin — hali yozilmagan logikaga test yozib bo'lmaydi). Fayl egaligi buzilmadi: mavjud test fayllariga tegilmadi.

**`lead` ostidagi chetga chiqish.** `tester` assertion'lari "tishlaydimi" yo'qmi tekshirmoqchi bo'lib, avval `src/routers/health.router.ts` da mutatsiya qilmoqchi bo'ldi — **permission tizimi `src/` ga yozishni bloklab to'xtatdi** (unga `src/` ga tegmaslik aytilgan edi). Keyin o'z test faylining buzilgan vaqtinchalik nusxasini ishga tushirdi; 6 test kutilgan sabab bilan yiqildi, ya'ni assertion'lar bo'sh o'tmaydi. Nusxa o'chirildi. Niyat asosli edi, faqat vaqtlanishi baxtsiz bo'ldi — o'sha nusxa `lead` ning birinchi shuffle tekshiruviga tushib qolgan.

**`/health` haqida kuzatuv.** `app.ts` router'ni `app.use('/', route.router)` bilan ulaydi va `path` marshrut ichida qo'llanadi. Agar kimdir keyinchalik uni `app.use(route.path, route.router)` ga o'zgartirsa, barcha route'lar `/health/health`, `/users/users` bo'lib qoladi — yangi test buni darhol ushlaydi.

### 5. Yakuniy verifikatsiya (asosiy sessiya o'zi ishga tushirdi)

| Bosqich                                               | Natija                              |
| ----------------------------------------------------- | ----------------------------------- |
| `npm run type-check`                                  | ✅ exit 0 (`src` va `src + test`)   |
| `npm test`                                            | ✅ 4 fayl, **55 test** o'tdi        |
| `npx vitest run --sequence.shuffle` (bir necha urug') | ✅ 55/55 — tartibga bog'liqlik yo'q |
| `npm run test:coverage`                               | ✅ ishlaydi (v8)                    |

Jonli server bilan `GET /health` **asosiy sessiya tomonidan alohida sinalmadi** — integratsiya testi haqiqiy `App` ni haqiqiy Mongo ulanishi bilan ko'tarib o'sha yo'lni bosib o'tadi. `lead` uni jonli ham tekshirganini aytdi.

### 6. Ochiq savollar

~~**`/health` readiness probe bo'lsinmi?**~~ — **HAL QILINDI**, yuqoridagi "Tooling muammolarini ketma-ket tuzatish" yozuvining 6-bosqichiga qarang.

~~**`ErrorMiddleware` da 5xx `HttpException` maskalanadi — shundaymi kerak?**~~ — **HAL QILINDI**, yuqoridagi 8-bosqichga qarang. Quyida muammoning dastlabki tavsifi saqlanadi. Hozirgi shart faqat status'ga qaraydi:

```ts
const clientMessage = status >= 500 && env.NODE_ENV === 'prod' ? 'Internal server error' : message;
```

Ya'ni prod'da **ataylab tashlangan** `HttpException(503, 'To'lov provayderi javob bermadi')` xabari ham yo'qoladi. `CLAUDE.md` esa "`HttpException` — operatsion xato, `status` va `message` client'ga boradi" deydi. Kod o'zgartirilmadi, test haqiqiy xulq bo'yicha yozildi. Agar niyat operatsion 5xx xabari o'tishi bo'lsa, shart `!isHttpException && status >= 500 && ...` bo'lishi kerak — bu qaror egasiga tegishli.

---

## 2026-08-29 — Boilerplate tozalash + kritik bug'larni tuzatish

**Maqsad:** loyihani demo/test qoldiqlaridan tozalab, qayta ishlatiladigan toza skeletga aylantirish va skeletda qolayotgan kritik xatoliklarni tuzatish.

### 1. Vault butunlay olib tashlandi

`src/config/vault.config.ts` o'chirildi, `src/config/index.ts` dan eksporti olib tashlandi, `node-vault` + `@types/node-vault` dependency'lari o'chirildi (lockfile'dan 57 paket, 633 qator ketdi).

**Nega:** `VaultClient.init()` loyihada hech qayerda chaqirilmasdi — to'liq o'lik kod. Ustiga `getAllSecrets()` `console.log(secret)` orqali secret'ni logga chiqarardi va `path` parametrini e'tiborsiz qoldirib, yo'lni hardcode qilardi.

### 2. User vertikali bo'sh skeletga aylantirildi

| Fayl                               | Holat                                                            |
| ---------------------------------- | ---------------------------------------------------------------- |
| `src/models/user.model.ts`         | bo'sh schema + `timestamps: true` + `toJSON` transform           |
| `src/interfaces/user.interface.ts` | faqat `_id?`, `createdAt?`, `updatedAt?`                         |
| `src/dtos/user.dto.ts`             | bo'sh `class CreateUserDto {}`                                   |
| `src/services/user.service.ts`     | 5 metod signature'i, tanasi `throw new Error('Not implemented')` |

**Nega:** bu boilerplate — har bir yangi loyiha o'z entity'sini noldan yozadi. `email`/`password` maydonlari va CRUD implementatsiyasi demo edi. Controller/router saqlandi — ular qatlamlarni qanday ulash kerakligini ko'rsatadi.

**Qaror:** metod tanalari bo'sh emas, `throw new Error('Not implemented')` — bo'sh tana `Promise<T>` signature'ida kompilyatsiya xatosi beradi. `bcrypt` dependency saqlandi (auth bosqichi uchun).

### 3. Tuzatilgan kritik bug'lar

| #   | Muammo                                                                                                                                 | Yechim                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `createdAt: { default: new Date() }` — `new Date()` modul yuklanganda **bir marta** hisoblanardi, barcha yozuvlar bir xil vaqt olardi  | `timestamps: true`                                                                                                                                            |
| 2   | Parol hash'i API javoblarida qaytardi (`GET /users` — barcha hash'lar)                                                                 | Domen maydonlari olib tashlandi; `toJSON` transform + `select: false` konvensiyasi hujjatlashtirildi                                                          |
| 3   | `App` konstruktorida `connectToDatabase()` `await`siz — Mongo o'chiq bo'lsa ham server `listen` qilardi, xato `try/catch` ga tushmasdi | `App.initialize()` async metodi; `server.ts` da `await app.initialize()` → `app.listen()`                                                                     |
| 4   | `DELETE` javobi `204` bilan — Express body'ni tashlab yuborardi, client hech nima olmasdi                                              | `204` → `200`                                                                                                                                                 |
| 5   | Prod'da har qanday `error.message` client'ga uzatilardi (Mongoose/driver ichki tafsilotlari)                                           | `HttpException` va kutilmagan xatolar ajratildi; prod'da 5xx → `'Internal server error'`; `stack` faqat logga; error handler ichidagi `next()` olib tashlandi |
| 6   | `whitelist`/`forbidNonWhitelisted` default `false` — mass-assignment                                                                   | Ikkalasi `true`                                                                                                                                               |
| 7   | `useNewUrlParser`/`useUnifiedTopology` — `connect()` ga uzatilmasdi va Mongoose 8 da olib tashlangan                                   | `options` obyekti o'chirildi                                                                                                                                  |
| 8   | `EnvVars` tipi zod schema'dan alohida qo'lda yozilgan; `NODE_ENV` bo'lmasa `.env.undefined` o'qilardi                                  | `z.infer<typeof envSchema>`; `NODE_ENV ?? 'dev'` fallback                                                                                                     |
| 9   | Noma'lum route Express'ning HTML sahifasini qaytarardi, JSON kontrakti buzilardi                                                       | `app.ts` da catch-all `HttpException(404, ...)`                                                                                                               |
| 10  | `strict: true` bo'lsa ham `strictNullChecks: false` type safety'ni bekor qilardi                                                       | `tsconfig.json` dan olib tashlandi                                                                                                                            |

**Eslatma (#5):** dastlabki implementatsiya kutilmagan xatolar uchun **har doim** `'Unexpected error'` qo'yardi, natijada dev'da ham haqiqiy sabab HTTP javobida ko'rinmasdi. Tuzatildi: dev/test'da haqiqiy `error.message`, prod'da generic.

**Eslatma (#10):** `strictNullChecks` yoqilgach **hech qanday xato chiqmadi** — skelet holatidagi kodda `null` bilan ishlaydigan real logika qolmagan edi. Bu bayroq keyinchalik implementatsiya yozilganda o'zini oqlaydi.

### 4. Verifikatsiya natijalari

| #   | Bosqich                                      | Natija                                                                                                                                                                              |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npx tsc --noEmit`                           | ✅ exit 0, chiqishsiz; `--showConfig` `strictNullChecks: true` ni tasdiqladi                                                                                                        |
| 2   | `npx swc ./src -d dist --copy-files`         | ✅ 27 fayl (avval 28 edi — vault ketdi); alias'lar nisbiy `require()` ga to'g'ri aylandi                                                                                            |
| 3   | DB ulanib, `Connected` → `listening` tartibi | ✅ `Successfully connected to Database!` `🚀 App listening` dan **oldin** chiqdi                                                                                                    |
| 4   | DB o'chiq → server `listen` qilmasligi       | ✅ `[Bootstrap] Failed to start app: MongooseServerSelectionError`, exit 1, `🚀 App listening` chiqmadi. Stack zanjiri: `bootstrap → initialize → connectToDatabase → dbConnection` |
| 5   | 404 kontrakti                                | ✅ `404` + `{"success":false,"message":"Route /... not found","data":null}`                                                                                                         |
| 6   | Validatsiya pipeline'i                       | ⚠️ `400` (to'g'ri), lekin xabar `"an unknown value was passed to the validate function"` — pastga qarang                                                                            |
| 7   | Skelet `500` + prod'da generic               | ✅ dev: `"Not implemented"`, prod: `"Internal server error"`                                                                                                                        |

**Test muhiti:** MongoDB Docker konteynerida — `docker run -d --name mongo -p 27017:27017 mongo:latest`. Lokal `mongod` o'rnatilmagan.

**Qo'shimcha sinov — #1 bug (bir xil `createdAt`) haqiqiy DB'da:** ketma-ket ikkita hujjat 1200 ms oraliq bilan yaratildi.

```
A.createdAt = 2026-08-29T13:19:32.452Z
B.createdAt = 2026-08-29T13:19:33.704Z
farq        = 1252 ms
toJSON      = {"_id":"...","createdAt":"...","updatedAt":"..."}   // __v yo'q
```

Eski kodda ikkalasi **bir xil** bo'lardi (server ko'tarilgan paytdagi vaqt). `updatedAt` ham ishlayapti, `toJSON` transform `__v` ni olib tashlayapti.

**6-bosqichdagi anomaliya:** bo'sh DTO'da validatsiya metadatasi yo'q, class-validator 0.14 esa `forbidUnknownValues: true` default'i bilan bunday obyektni rad etadi. Alohida sinov bilan tasdiqlandi: bo'sh klass → `unknownValue`, bitta `@IsEmail()` qo'shilgan klass → `"property foo should not exist"`. Ya'ni xulq to'g'ri (DTO to'ldirilmaguncha endpoint yopiq), faqat xabar chalg'ituvchi. `CLAUDE.md` da hujjatlashtirildi.

### 5. Qamrovga kiritilmagan (ataylab)

Tooling: ESLint v9 flat config, Windows'da ishlamaydigan `dev`/`clean` script'lari, `main` vs `start` yo'l ziddiyati, ziddiyatli `build` bayroqlari, ortiqcha dep'lar, husky `prepare`.

Kod: JWT auth + role guard, testlar, logger, graceful shutdown, health check, rate limiting, CORS whitelist, body size limit, `UpdateUserDto`, ObjectId validatsiyasi, pagination, bo'sh `src/models/abstract.model.ts`, `GET /users/:id`.
