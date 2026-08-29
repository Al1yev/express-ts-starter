---
description: Loyihani to'liq tekshiradi - tiplar, build, DB bootstrap va jonli HTTP smoke-test
---

Quyidagi verifikatsiya bosqichlarini ketma-ket bajar. Har birining natijasini o'zing ko'rib chiq — agent hisobotiga emas, haqiqiy chiqishga ishon. Oxirida jadval ko'rinishida hisobot ber va o'tmagan bosqichlarni aniq ayt.

## 1. Tiplar

```
npm run type-check
```
Exit 0 va chiqishsiz bo'lishi kerak. `strictNullChecks` yoqilganini tasdiqlash uchun: `npx tsc --showConfig | grep strictNullChecks`.

## 2. Build

```
npx swc ./src -d dist --copy-files
```
Barcha fayllar kompilyatsiya bo'lishi va path alias'lar (`@config`, `@models`, ...) nisbiy `require()` ga aylanishi kerak. Tekshirish: `grep 'require("' dist/src/app.js`.

## 3. DB ulanish tartibi

MongoDB kerak. Ishlamayotgan bo'lsa: `docker start mongo`, yoki yo'q bo'lsa `docker run -d --name mongo -p 27017:27017 mongo:latest`.

```
npm run dev
```
`Successfully connected to Database!` **`🚀 App listening`** dan **oldin** chiqishi shart — bu DB ulanishi `await` qilinayotganini isbotlaydi. Tekshirgach jarayonni to'xtat (Windows'da `tsx` bola-jarayon qoldirishi mumkin — `netstat -ano | grep ":5000"` bilan tasdiqlab, kerak bo'lsa `taskkill //F //PID <pid>`).

## 4. DB o'chiq holatda fail-fast

Mongo'ni to'xtat (`docker stop mongo`) va serverni qayta ishga tushir. Server `listen` qilmasligi, `[Bootstrap] Failed to start app:` chiqarib `exit 1` qilishi kerak. Tekshirgach Mongo'ni qayta yoq.

## 5-7. HTTP kontrakti

Server ko'tarilgan holda:

| So'rov | Kutilgan |
|---|---|
| `GET /yoq-route` | `404` + `{"success":false,"message":"Route /yoq-route not found","data":null}` |
| `POST /users` (ixtiyoriy body) | `400` — pastdagi eslatmaga qara |
| `GET /users` | `500` — dev'da haqiqiy xabar, prod'da `Internal server error` |

Prod xulqini ham tekshir: `npx cross-env NODE_ENV=prod npx tsx src/server.ts` bilan qayta ishga tushirib, `GET /users` javobida ichki xato matni **oshkor bo'lmasligini** tasdiqla. Bu error middleware'ning asosiy vazifasi.

## Kutilgan "g'alatiliklar" — bular bug emas

- `GET /users` → `500 Not implemented`: service ataylab skelet (`CLAUDE.md` ga qara).
- `POST /users` → `400 "an unknown value was passed to the validate function"`: `CreateUserDto` bo'sh, unda validatsiya metadatasi yo'q, class-validator esa `forbidUnknownValues: true` bilan bunday obyektni rad etadi. DTO'ga birinchi dekorator qo'shilishi bilan normal xabar (`property X should not exist`) ishlaydi.

Bu ikkisini "tuzatishga" urinma — ular skelet holatining kutilgan natijasi.
