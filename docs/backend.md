# Backend konvensiyalari

Kim o'qiydi: **`back` agenti** va domen logikasiga tegadigan har qanday ish. Umumiy kontekst (skelet holati, arxitektura oqimi) [`CLAUDE.md`](../CLAUDE.md) da.

## Javob formati

Har doim `{ success, message, data }`:

- Muvaffaqiyat: `res.success(data, statusCode?, message?)` (`ResponseMiddleware` `res` ga qo'shadi, default `200`/`'OK'`)
- Xato: `throw new HttpException(status, message)` — `ErrorMiddleware` ushlaydi
- `204` ishlatmang — Express body'ni tashlab yuboradi va javob formati buziladi. `DELETE` uchun `200`.

Status kodlarini mantiqan tanlang: topilmadi = `404`, konflikt/dublikat = `409`, yaroqsiz kirish = `400`, autentifikatsiya = `401`, ruxsat = `403`.

## Xatolar

`src/middlewares/error.middleware.ts`:

- `HttpException` — operatsion xato: `status` va `message` client'ga o'zgarmasdan boradi, **prod'da ham**, 5xx bo'lsa ham. Xabari client uchun yozilgan deb hisoblanadi — shuning uchun unga maxfiy ma'lumot qo'ymang
- Boshqa har qanday xato — `500`; **prod'da** client `'Internal server error'` oladi, dev/test'da haqiqiy xabar. Maskalash sharti `!isHttpException`, `status >= 500` emas
- `stack` faqat serverda logga yoziladi

**404** — `app.ts` da catch-all `HttpException(404, ...)` beradi, shuning uchun noma'lum route ham bir xil JSON formatda qaytadi.

## Qatlam chegaralari

- **Controller `@models` dan import qilmaydi.** Controller HTTP ↔ service tarjimoni; u ko'radigan tiplar `@interfaces` dan (`User`), mongoose tiplaridan (`UserDocument`) emas. Service `.lean()` ga o'tsa yoki DTO qaytara boshlasa, controller o'zgarmasligi kerak. Mongoose tipi service qatlamida to'xtaydi.
- **DI faqat service qatlamida.** `@Service()` + `Container.get(...)` — service uchun. Controller router ichida `new UserController()` bilan, router esa `src/server.ts` da `new UserRouter()` bilan yaratiladi. Controller yoki router'ga `@Service()` osmang.

## Validatsiya

`ValidationMiddleware(Dto, skipMissingProperties?, whitelist?, forbidNonWhitelisted?)`.
Default: `skipMissingProperties=false`, `whitelist=true`, `forbidNonWhitelisted=true`. Oxirgi ikkitasi mass-assignment'dan himoya qiladi — ularni `false` qilmang.

### Ma'lum g'alatilik: bo'sh DTO va validatsiya xabari

`POST /users` `400` qaytaradi, lekin xabar `"an unknown value was passed to the validate function"` bo'ladi — `"property foo should not exist"` emas.

Sababi: class-validator 0.14 da `forbidUnknownValues` default `true`, bo'sh klassda esa validatsiya metadatasi yo'q. DTO'ga birinchi dekorator (`@IsEmail()` va h.k.) qo'shilishi bilan normal xabarlar ishlaydi. Bu boilerplate kodidagi xato emas.

## Env

`src/config/env.config.ts`, zod bilan validatsiya. `EnvVars` tipi `z.infer` orqali schema'dan olinadi — qo'lda dublikat yozmang. Yangi o'zgaruvchi = `envSchema` ga qo'shish + `.env.example` ni yangilash. `NODE_ENV` berilmasa `dev` ishlatiladi.

Diqqat: `env.config.ts` modul yuklanganda validatsiya qiladi va xato bo'lsa `process.exit(1)` qiladi — jarayon **jim o'ladi**.

## `GET /health`

Readiness probe. DB ulanishi bo'lmasa (`mongoose` `readyState !== 1`) `503 Database unavailable` qaytaradi — `200 ok` emas, chunki DB'siz servis hech qanday foydali ish qila olmaydi. Ulanish holati `@database` dagi `isDbConnected()` orqali o'qiladi; router'lar mongoose'ni to'g'ridan-to'g'ri import qilmasin.

Muvaffaqiyatli javob: `{ status: 'ok', db: 'up', uptime, env }`.

`503` `HttpException` orqali tashlanadi, shuning uchun `'Database unavailable'` xabari prod'da ham client'ga yetib boradi.

## Mongoose tuzoqlari

- `findByIdAndUpdate` / `findOneAndUpdate` ga **doim** `{ new: true, runValidators: true }` bering — aks holda **eski** hujjat qaytadi va validatorlar ishlamaydi.
- Vaqt maydonlari uchun `default: new Date()` **yozmang** — u modul yuklanganda bir marta hisoblanadi. `timestamps: true` ishlating.
- Maxfiy maydonlar (`password`, tokenlar) `select: false` bo'lsin va `toJSON` transform'da javobdan chiqarilsin. **Parol hech qachon API javobida qaytmasin.**
- `strictNullChecks` yoqilgan: `findOne`/`findById` `null` qaytarishi mumkin — uni haqiqatan ishlang, `!` yoki `as` bilan yashirmang.

## Skelet servislardagi `eslint-disable`

Skelet service fayllari boshida fayl darajasidagi izoh turadi:

```ts
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await --
   Skelet: metodlar hali implementatsiya qilinmagan. Logika yozilganda bu qatorni o'chiring. */
```

Usiz `npm run lint` yiqiladi (ishlatilmagan parametrlar + `await`siz `async`). ESLint config'da glob override **ataylab ishlatilmagan** — u butun service qatlamini doimiy ko'r qilardi. **Implementatsiya yozganingizda bu qatorni o'chiring.**
