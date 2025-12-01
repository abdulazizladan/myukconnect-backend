import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.is_default) {
      await this.addressRepository.update(
        { user_id: userId },
        { is_default: false },
      );
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user_id: userId,
    });

    return await this.addressRepository.save(address);
  }

  async findAll(userId: string) {
    return await this.addressRepository.find({
      where: { user_id: userId },
      order: {
        is_default: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findOne(userId: string, addressId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(userId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(userId, addressId);

    if (updateAddressDto.is_default) {
      await this.addressRepository.update(
        { user_id: userId },
        { is_default: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async remove(userId: string, addressId: string) {
    const address = await this.findOne(userId, addressId);
    await this.addressRepository.remove(address);
    return { message: 'Address deleted successfully' };
  }

  async setDefault(userId: string, addressId: string) {
    await this.findOne(userId, addressId);

    await this.addressRepository.update(
      { user_id: userId },
      { is_default: false },
    );

    const address = await this.addressRepository.findOne({
      where: { id: addressId, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    address.is_default = true;
    return await this.addressRepository.save(address); 
  }
}
