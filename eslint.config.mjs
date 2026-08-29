// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // ESLint 9 flat config'da default ignore faqat `node_modules/` va `.git/`.
    // Nuqtali papkalar avtomatik chetlab o'tilmaydi — `.claude/hooks/format.mjs`
    // ATAYLAB lint qilinadi.
    { ignores: ['dist/', 'coverage/', '.husky/_/'] },

    js.configs.recommended,

    {
        files: ['**/*.ts'],
        extends: [tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                // `projectService: true` bu loyihada ISHLAMAYDI: u faylning eng yaqin
                // `tsconfig.json` ini qidiradi, root config esa faqat `src/**` ni
                // qamraydi va `tsconfig.test.json` nomi standart emas — natijada
                // `test/` dagi fayllar "was not found by the project service" beradi.
                // `allowDefaultProject` ham yaramaydi (glob'da `**` taqiqlangan).
                // Shuning uchun ikkala loyiha aniq ko'rsatiladi.
                project: ['./tsconfig.json', './tsconfig.test.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // `_req`, `_res`, `_next`, `_doc` konvensiyasi kodda allaqachon bor.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            // `declare global { namespace Express { interface Response ... } }` —
            // Express `Response` ini kengaytirishning yagona usuli. `allowDeclarations`
            // faqat ambient (`declare`) kontekstga ruxsat beradi; oddiy
            // `namespace Foo {}` taqiqligicha qoladi.
            '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
        },
    },

    // `class-transformer` / `class-validator` chegarasi: bu yerdagi `any` tashqi
    // kutubxona tipidan keladi (`plainToInstance` ning `ClassConstructor` i,
    // `validateOrReject` tashlaydigan xatolar), bizning tanlovimiz emas.
    {
        files: ['src/middlewares/validation.middleware.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
        },
    },

    // `@types/express` da `Request.body` tipi `any` (`ReqBody = any`), shuning uchun
    // `const userData: User = req.body` har doim report bo'ladi. Qiymatni
    // `ValidationMiddleware` allaqachon validatsiya qilib bergan.
    {
        files: ['src/controllers/*.controller.ts'],
        rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
    },

    // `supertest` javobining `body` tipi `any` (`@types/superagent`), `res.body.message`
    // kabi tekshiruvlar esa testning butun mazmuni. Har biriga tip yozish testni
    // og'irlashtiradi va hech nima bermaydi — `toEqual` allaqachon runtime tekshiruvi.
    //
    // Vitest global'lari (`describe`, `it`, `vi`, ...) uchun alohida `globals` KERAK EMAS:
    // `typescript-eslint` `.ts` fayllarda `no-undef` ni o'chiradi, tiplarni esa
    // `tsconfig.test.json` dagi `types: ["vitest/globals"]` beradi.
    {
        files: ['test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/unbound-method': 'off',
        },
    },

    // Hech qaysi tsconfig'da yo'q fayllar: `vitest.config.mts`,
    // `.claude/hooks/format.mjs` va shu configning o'zi. Yuqoridagi TS bloki
    // `**/*.ts` ga bog'langani uchun bu yerda tip-aware qoidalar yoqilmaydi,
    // ya'ni `project` talab qilinmaydi va parse error bo'lmaydi.
    {
        files: ['**/*.mts', '**/*.cts'],
        languageOptions: { globals: globals.node, parser: tseslint.parser },
    },
    {
        files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
        languageOptions: { globals: globals.node },
    },
);
