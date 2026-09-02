import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    public name!: string;

    @IsNumber()
    @Min(0)
    public price!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    public manufacturer!: string;
}
