import { Router } from 'express';
import { Routes } from '@interfaces';
import { ProductController } from '@controllers';
import { ValidationMiddleware } from '@middlewares';
import { CreateProductDto } from '@dtos';

export class ProductRouter implements Routes {
    public path = '/products';
    public router = Router();
    public product = new ProductController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.product.getProducts);
        this.router.get('/:id', this.product.getProductById);
        this.router.post('/', ValidationMiddleware(CreateProductDto), this.product.createProduct);
        this.router.put(
            '/:id',
            ValidationMiddleware(CreateProductDto, true),
            this.product.updateProduct,
        );
        this.router.delete('/:id', this.product.deleteProduct);
    }
}
