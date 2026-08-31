---
description: Yangi entity uchun to'liq qatlam skeletini yaratadi (interface -> model -> dto -> service -> controller -> router)
argument-hint: <EntityName> (masalan Product)
---

`$ARGUMENTS` entity'si uchun to'liq vertikal yarat. Nom berilmagan bo'lsa, foydalanuvchidan so'ra.

Nom konvensiyasi: klass/interface `PascalCase` (`Product`), fayl `camelCase.<layer>.ts` (`product.model.ts`), route `kebab-case` ko'plikda (`/products`), Mongoose model nomi `PascalCase` birlikda (`'Product'`).

## Yaratiladigan fayllar

Har birini mavjud `user.*` fayllaridan nusxa ol — ular shu loyihaning namunasi. Domen maydonlarini **o'ylab topma**: foydalanuvchi aytmagan bo'lsa `// TODO: define fields` qoldir.

1. `src/interfaces/<name>.interface.ts` — `_id?`, `createdAt?`, `updatedAt?` va TODO
2. `src/models/<name>.model.ts` — `HydratedDocument` tipi, `timestamps: true`, `toJSON` transform (`__v` olib tashlanadi). Maxfiy maydonlar uchun `select: false` ishlat.
3. `src/dtos/<name>.dto.ts` — `Create<Name>Dto` (kerak bo'lsa `Update<Name>Dto` ham)
4. `src/services/<name>.service.ts` — `@Service()` dekoratori bilan; metod tanalari `throw new Error('Not implemented')`.
   Fayl boshiga skelet izohini qo'y, aks holda `npm run lint` yiqiladi (ishlatilmagan parametrlar + `await`siz `async`):
    ```ts
    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await --
       Skelet: metodlar hali implementatsiya qilinmagan. Logika yozilganda bu qatorni o'chiring. */
    ```
5. `src/controllers/<name>.controller.ts` — `Container.get(<Name>Service)`, har metod `try/catch` + `next(error)`, javob `res.success(data, status?, message?)`
6. `src/routers/<name>.router.ts` — `Routes` interface'ini implement qiladi, `ValidationMiddleware(Dto)` yozuv operatsiyalarida.
   **`path` majburiy** (`public path = '/<names>'`), va prefiksni `app.ts` qo'yadi — router ichida yo'llarni prefikssiz yoz: `this.router.get('/', ...)`, `this.router.get('/:id', ...)`. `${this.path}` ni takrorlasang yo'l ikki marta prefikslanadi.

## Ulash — buni unutish eng ko'p uchraydigan xato

7. Har bir papkaning `index.ts` barrel faylini yangila (`src/interfaces/index.ts`, `src/models/index.ts`, va hokazo) — alias import'lar (`@models`) shu barrel'lar orqali ishlaydi.
8. `src/server.ts` da router'ni ro'yxatdan o'tkaz: `new App([new UserRouter(), new <Name>Router()])`.

## Konvensiyalar (buzma)

- Xatolar: `throw new HttpException(status, message)` — `@exceptions` dan. Topilmadi = `404`, konflikt = `409`.
- **`204` ishlatma** — Express body'ni tashlab yuboradi va `{success, message, data}` kontrakti buziladi. `DELETE` uchun `200`.
- `findByIdAndUpdate` chaqirsang `{ new: true, runValidators: true }` ber, aks holda **eski** hujjat qaytadi.
- Import'lar path alias orqali (`@services`, `@dtos`), nisbiy yo'l bilan emas.
- Controller `@models` dan import qilmaydi — tiplar `@interfaces` dan olinadi. Mongoose tipi service qatlamida to'xtaydi.
- Yangi papka qo'shsang, alias'ni **uch joyda** e'lon qil: `tsconfig.json` (`paths`), `.swcrc` (`jsc.paths`), va papkaning `index.ts` barrel'i.

## Yakunda

`npm run type-check` va `npm run lint` ni ishga tushir — ikkalasi ham xatosiz o'tishi shart. Keyin `PROGRESS.md` ga qisqa yozuv qo'sh: qaysi entity qo'shildi va qaysi fayllar yaratildi.
