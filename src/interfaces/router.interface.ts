import { Router } from 'express';

export interface Routes {
    /**
     * Router shu prefiks ostiga o'rnatiladi (`app.ts` dagi `initializeRouters`).
     * Router ichida yo'llar prefikssiz yoziladi: `this.router.get('/:id', ...)`.
     * Majburiy -- ixtiyoriy bo'lganda prefiksni unutish jimgina `/` ga
     * o'rnatilishga va router'lar to'qnashuviga olib kelardi.
     */
    path: string;
    router: Router;
}
