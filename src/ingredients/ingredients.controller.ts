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
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientQueryDto } from './dto/ingredient-query.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/role.enum';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiBody({ type: CreateIngredientDto })
  @ApiResponse({
    status: 201,
    description: 'Ingredient created successfully.',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all ingredients with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of ingredients retrieved successfully.',
    type: [IngredientResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  findAll(@Query() query: IngredientQueryDto) {
    return this.ingredientsService.findAll(query);
  }

  @Public()
  @Get('barcode/:code')
  @ApiOperation({ summary: 'Look up an ingredient by barcode' })
  @ApiParam({
    name: 'code',
    description: 'Barcode string (8–14 digits)',
    example: '0123456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingredient retrieved successfully.',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ingredient not found.', type: ErrorResponseDto })
  findByBarcode(@Param('code') code: string) {
    return this.ingredientsService.findByBarcode(code);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single ingredient by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Ingredient ID' })
  @ApiResponse({
    status: 200,
    description: 'Ingredient retrieved successfully.',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ingredient not found.', type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(+id);
  }

  @Patch(':id')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiParam({ name: 'id', type: Number, description: 'Ingredient ID' })
  @ApiBody({ type: UpdateIngredientDto })
  @ApiResponse({
    status: 200,
    description: 'Ingredient updated successfully.',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Ingredient not found.', type: ErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(+id, updateIngredientDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete an ingredient (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Ingredient ID' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden – admin role required.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Ingredient not found.', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Ingredient is referenced by recipes or inventory items.', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(+id);
  }
}
