import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { is_active: true };
    return await this.productRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findByCategory(category: string) {
    return await this.productRepository.find({
      where: {
        category,
        is_active: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.findOne(id);

    const newStock = product.stock_quantity + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.update(id, { stock_quantity: newStock });
  }
}
