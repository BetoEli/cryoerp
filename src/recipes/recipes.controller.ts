import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ApiOperation } from '@nestjs/swagger';
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recipesService.create(createRecipeDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.recipesService.findAll(user.id);
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get recipes that can be made with current inventory',
  })
  findAvailable(@CurrentUser() user: JwtPayload) {
    return this.recipesService.findAvailable(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.findOne(+id, user.id);
  }

  @Get(':id/availability')
  @ApiOperation({
    summary: 'Check if a recipe can be made with current inventory',
  })
  checkAvailability(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.checkAvailability(+id, user.id);
  }

  @Get(':id/shopping-list')
  @ApiOperation({ summary: 'Get shopping list for missing ingredients' })
  getShoppingList(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.getShoppingList(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recipesService.update(+id, updateRecipeDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recipesService.remove(+id, user.id);
  }
}
