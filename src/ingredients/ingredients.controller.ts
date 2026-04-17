import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientQueryDto } from './dto/ingredient-query.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/role.enum';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Public()
  @ApiOperation({ summary: 'Get all ingredients with optional filters' })
  @Get()
  findAll(@Query() query: IngredientQueryDto) {
    return this.ingredientsService.findAll(query);
  }

  @Public()
  @ApiOperation({ summary: 'Get an ingredient by barcode' })
  @Get('barcode/:code')
  findByBarcode(@Param('code') code: string) {
    return this.ingredientsService.findByBarcode(code);
  }

  @Public()
  @ApiOperation({ summary: 'Get an ingredient by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ingredient' })
  update(
    @Param('id')
    id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(+id, updateIngredientDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an ingredient' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(+id);
  }
}
