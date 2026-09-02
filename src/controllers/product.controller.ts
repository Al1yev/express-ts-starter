import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ProductService } from '@services';
import { Product } from '@interfaces';

export class ProductController {
    public product = Container.get(ProductService);

    public getProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllProductsData: Product[] = await this.product.findAllProduct();

            res.success(findAllProductsData);
        } catch (error) {
            next(error);
        }
    };

    public getProductById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId: string = req.params.id;
            const findProductData: Product = await this.product.findProductById(productId);

            res.success(findProductData);
        } catch (error) {
            next(error);
        }
    };

    public createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productData: Product = req.body;
            const createProductData: Product = await this.product.createProduct(productData);

            res.success(createProductData, 201, 'created');
        } catch (error) {
            next(error);
        }
    };

    public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId: string = req.params.id;
            const productData: Partial<Product> = req.body;
            const updateProductData: Product = await this.product.updateProduct(
                productId,
                productData,
            );

            res.success(updateProductData, 200, 'updated');
        } catch (error) {
            next(error);
        }
    };

    public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId: string = req.params.id;
            const deleteProductData: Product = await this.product.deleteProduct(productId);

            res.success(deleteProductData, 200, 'deleted');
        } catch (error) {
            next(error);
        }
    };
}
