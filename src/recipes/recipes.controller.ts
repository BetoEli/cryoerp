import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { ShoppingListResponseDto } from './dto/shopping-list-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiCookieAuth('access_token')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiBody({ type: CreateRecipeDto })
  @ApiResponse({
    status: 201,
    description: 'Recipe created successfully.',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recipesService.create(createRecipeDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all recipes for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of recipes retrieved successfully.',
    type: [RecipeResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.recipesService.findAll(user.id);
  }

  @Get('available')
  @ApiOperation({ summary: 'List recipes that can be made with current inventory' })
  @ApiResponse({
    status: 200,
    description: 'List of makeable recipes retrieved successfully.',
    type: [RecipeResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  findAvailable(@CurrentUser() user: JwtPayload) {
    return this.recipesService.findAvailable(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single recipe by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Recipe retrieved successfully.',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Recipe not found.', type: ErrorResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.findOne(+id, user.id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check if a recipe can be made with current inventory' })
  @ApiParam({ name: 'id', type: Number, description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability check completed successfully.',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Recipe not found.', type: ErrorResponseDto })
  checkAvailability(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.checkAvailability(+id, user.id);
  }

  @Get(':id/shopping-list')
  @ApiOperation({ summary: 'Get a shopping list of missing ingredients for a recipe' })
  @ApiParam({ name: 'id', type: Number, description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Shopping list retrieved successfully.',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Recipe not found.', type: ErrorResponseDto })
  getShoppingList(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.getShoppingList(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({ name: 'id', type: Number, description: 'Recipe ID' })
  @ApiBody({ type: UpdateRecipeDto })
  @ApiResponse({
    status: 200,
    description: 'Recipe updated successfully.',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Recipe not found.', type: ErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recipesService.update(+id, updateRecipeDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({ name: 'id', type: Number, description: 'Recipe ID' })
  @ApiResponse({ status: 200, description: 'Recipe deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Recipe not found.', type: ErrorResponseDto })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.remove(+id, user.id);
  }
}
