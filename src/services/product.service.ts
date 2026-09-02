import { Service } from 'typedi';
import { ProductDocument, ProductModel } from '@models';
import { Product } from '@interfaces';
import { HttpException } from '@exceptions';

@Service()
export class ProductService {
    public async findAllProduct(): Promise<ProductDocument[]> {
        return ProductModel.find();
    }

    public async createProduct(productData: Product): Promise<ProductDocument> {
        return ProductModel.create(productData);
    }

    public async findProductById(productId: string): Promise<ProductDocument> {
        const findProduct = await ProductModel.findById(productId);
        if (!findProduct) throw new HttpException(404, "Product doesn't exist");

        return findProduct;
    }

    public async updateProduct(
        productId: string,
        productData: Partial<Product>,
    ): Promise<ProductDocument> {
        const updateProduct = await ProductModel.findByIdAndUpdate(productId, productData, {
            new: true,
            runValidators: true,
        });
        if (!updateProduct) throw new HttpException(404, "Product doesn't exist");

        return updateProduct;
    }

    public async deleteProduct(productId: string): Promise<ProductDocument> {
        const deleteProduct = await ProductModel.findByIdAndDelete(productId);
        if (!deleteProduct) throw new HttpException(404, "Product doesn't exist");

        return deleteProduct;
    }
}
