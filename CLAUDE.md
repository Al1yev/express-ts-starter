# express-ts-boilerplate

Qayta ishlatiladigan Express 5 + TypeScript starter. Mongoose 8, typedi (DI), class-validator (DTO), zod (env), swc (build), CommonJS.

Bu fayl **yadro** — har sessiyaga va har bir subagent chaqiruviga avtomatik yuklanadi, shuning uchun unda faqat **hammaga** kerak bo'lgan ma'lumot turadi. Bir agentga yoki bir mavzuga taalluqli hamma narsa [`docs/`](./docs/) da: oxirgi jadvaldan **o'zingizga tegishlisini** oching, boshqasini emas.

## ⚠️ Bu loyiha ataylab SKELET holatda

Domen logikasi va domen maydonlari **ataylab olib tashlangan**. Quyidagilar **bug emas**:

- `src/services/user.service.ts` — barcha metodlar `throw new Error('Not implemented')`
- `src/models/user.model.ts` — schema bo'sh (`// TODO: define fields`)
- `src/interfaces/user.interface.ts` — faqat `_id?`, `createdAt?`, `updatedAt?`
- `src/dtos/user.dto.ts` — bo'sh `class CreateUserDto {}`
- `GET /users` → `500 Not implemented` (dev) — kutilgan natija
- `POST /users` → `400`, lekin xabar g'alati (`"an unknown value was passed..."`) — sababi [`docs/backend.md`](./docs/backend.md) da

Har bir yangi loyiha o'z entity'sini shu skelet ustiga yozadi. **Ularni "tuzatmang"** — implementatsiya yoki domen maydonlari qo'shish faqat aniq talab bo'lganda.

## Arxitektura

```
router → controller → service → model
```

- `src/app.ts` — `App` klassi: middleware'lar, router'lar, error handling. **`initialize()` ni `listen()` dan oldin `await` qiling** — DB ulanishi shu yerda.
- `src/server.ts` — `bootstrap()`: `new App([...])` → `await app.initialize()` → `app.listen()`. DB xatosi → `process.exit(1)`.
- Har bir router `Routes` interface'ini implement qiladi (`path` + `router`).

## Buzilmaydigan qoidalar

1. **Javob formati** har doim `{ success, message, data }` — `res.success(...)` yoki `throw new HttpException(status, message)`. **`204` ishlatilmaydi**, `DELETE` uchun `200`.
2. **Import'lar path alias orqali** (`@services`, `@models`, ...), nisbiy yo'l bilan emas. Alias **uch joyda** e'lon qilinadi va sinxron turadi.
3. **Yangi fayl o'z papkasining `index.ts` barreliga** qo'shiladi, yangi router esa `src/server.ts` dagi `new App([...])` massiviga. Bularni unutish eng ko'p uchraydigan xato.
4. **Kod uslubi:** 4 space indent, single quotes, trailing comma `all`, printWidth 100, semicolon majburiy (`.prettierrc.json`).

O'zgarish kiritgach `npm run type-check`, testga tegilgan bo'lsa `npm test` — ikkalasi ham xatosiz o'tishi shart.

## Qayerda nima yozilgan

| Mavzu                                                                | Fayl                                       | Kim o'qiydi    |
| -------------------------------------------------------------------- | ------------------------------------------ | -------------- |
| Javob formati, xato maskalash, validatsiya, env, `/health`, mongoose | [`docs/backend.md`](./docs/backend.md)     | `back`         |
| Papka kartasi, alias'lar, barrel, ulash nuqtalari, nomlash           | [`docs/structure.md`](./docs/structure.md) | `arch`         |
| Test infratuzilmasi va uning tuzoqlari                               | [`docs/testing.md`](./docs/testing.md)     | `tester`       |
| Script'lar, husky hook'lari, ESLint konfiguratsiyasi                 | [`docs/tooling.md`](./docs/tooling.md)     | asosiy sessiya |
| Agentlar, slash-buyruqlar, hook'lar                                  | [`.claude/README.md`](./.claude/README.md) | asosiy sessiya |
| Bajarilgan ishlar va qarorlar tarixi                                 | [PROGRESS.md](./PROGRESS.md)               | asosiy sessiya |

**`PROGRESS.md` — har bajarilgan ishdan keyin yozuv qo'shiladi** (asosiy sessiya, subagentlar emas): maqsad, o'zgargan fayllar, qarorlar va sabablari, verifikatsiya natijalari. Yangi yozuv faylning tepasiga.
