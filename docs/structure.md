# Struktura va path alias'lar

Kim o'qiydi: **`arch` agenti** va yangi fayl/papka qo'shadigan har qanday ish. Umumiy kontekst (skelet holati, arxitektura oqimi) [`CLAUDE.md`](../CLAUDE.md) da.

## Papka kartasi

Ildizdagi ikki fayl qatlamlarga kirmaydi:

| Fayl            | Nima uchun muhim                                                                           |
| --------------- | ------------------------------------------------------------------------------------------ |
| `src/app.ts`    | `App` klassi: middleware zanjiri, router'larni ulash, 404 va error handling                |
| `src/server.ts` | `bootstrap()`: `new App([...])` — **yangi router shu massivga qo'shilmasa, endpoint yo'q** |

Qatlam papkalari — har birida `index.ts` barrel va o'z alias'i:

| Papka          | Bu yerga nima tushadi                                     |
| -------------- | --------------------------------------------------------- |
| `config/`      | Env sxemasi va konfiguratsiya (`env.config.ts`, zod)      |
| `controllers/` | HTTP ↔ service tarjimasi                                 |
| `database/`    | Mongoose ulanishi va ulanish holati (`isDbConnected()`)   |
| `dtos/`        | class-validator bilan kirish validatsiyasi                |
| `exceptions/`  | Xato klasslari (`HttpException`)                          |
| `interfaces/`  | Tiplar va interface'lar (`Routes`, entity interface'lari) |
| `middlewares/` | Express middleware'lari (error, response, validation)     |
| `models/`      | Mongoose schema'lar                                       |
| `routers/`     | Yo'llar va middleware zanjiri                             |
| `services/`    | Biznes logikasi, `@Service()` bilan DI                    |
| `utils/`       | Qatlamga bog'liq bo'lmagan sof funksiyalar                |

Testlar `src/` da emas, `test/` da: `*.test.ts`, yordamchilar `test/helpers/`.

## Path alias'lar

`@config`, `@controllers`, `@database`, `@dtos`, `@exceptions`, `@interfaces`, `@middlewares`, `@models`, `@routers`, `@services`, `@utils` — har biri o'z papkasidagi `index.ts` ga. `@/*` → `src/*`.

Alias'lar **uch joyda** e'lon qilingan va sinxron turishi shart:

1. `tsconfig.json` — `compilerOptions.paths`
2. `.swcrc` — `jsc.paths`
3. Papkaning o'z `index.ts` barrel eksporti

Yangi papka qo'shsangiz uchalasini ham yangilang, aks holda import yo tip darajasida, yo build'da sinadi. Har alias ikki qator bilan e'lon qilinadi: `"@x": ["x/index.ts"]` va `"@x/*": ["x/*"]`.

**To'rtinchi joy yo'q va kerak emas.** `vitest.config.mts` da `resolve: { tsconfigPaths: true }`, `build:tsc` da `tsc-alias`, `dev` da `tsx` — uchalasi ham alias'ni `tsconfig.json` dan o'zi oladi. Ya'ni haqiqiy nusxa faqat bitta: `.swcrc` dagi `jsc.paths`. O'zgartirsangiz, `tsconfig.json` va `.swcrc` bir-biriga aynan mos turishi shart.

Import'lar **doim alias orqali** — papkalararo nisbiy yo'l (`../`) ishlatilmaydi. Bir papka ichidagi `./` normal (`src/utils/index.ts` dagi `./text.utils`).

## Ulash nuqtalari — eng ko'p unutiladigan qadamlar

| Nima qo'shildi   | Qayerga ulanadi                                                 |
| ---------------- | --------------------------------------------------------------- |
| Har qanday fayl  | O'z papkasining `index.ts` barreli                              |
| Yangi router     | `src/server.ts` dagi `new App([...])` massivi                   |
| Yangi middleware | `src/app.ts` dagi `initializeMiddlewares()`                     |
| Yangi papka      | `tsconfig.json` + `.swcrc` + barrel, so'ng shu faylni yangilash |

### Router prefiksi — kim qo'yadi

`Routes.path` **majburiy** va prefiksni **`app.ts` qo'yadi**: `this.app.use(route.path, route.router)`.

Demak router ichida yo'llar **prefikssiz** yoziladi:

```ts
export class ProductRouter implements Routes {
    public path = '/products'; // <- prefiks shu yerda, bir marta
    public router = Router();

    private initializeRoutes() {
        this.router.get('/', this.product.getProducts); // -> GET /products
        this.router.get('/:id', this.product.getProductById); // -> GET /products/:id
    }
}
```

`${this.path}` ni router ichida takrorlamang — yo'l ikki marta prefikslanadi (`/products/products`).

## Nom konvensiyalari

| Nima                | Qanday                                         |
| ------------------- | ---------------------------------------------- |
| Fayl                | `camelCase.<layer>.ts` — `product.service.ts`  |
| Klass / interface   | `PascalCase` — `ProductService`, `Product`     |
| Route               | `kebab-case`, ko'plikda — `/products`          |
| Mongoose model nomi | `PascalCase`, birlikda — `'Product'`           |
| Papka va alias      | ko'plikda, bir xil — `services/` → `@services` |

Yangi entity uchun butun vertikalni `/scaffold <EntityName>` yaratadi — qo'lda qatlam-qatlam yozib chiqmang.
