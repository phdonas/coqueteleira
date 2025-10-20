import Dexie, { Table } from 'dexie';
import { Recipe, RecipeIngredient } from './types';

export class AppDB extends Dexie {
  recipes!: Table<Recipe, string>;
  recipe_ingredients!: Table<RecipeIngredient, string>;

  constructor() {
    super('coqueteleira');
    this.version(1).stores({
      recipes: 'id, nome, codigo, created_at, updated_at',
      recipe_ingredients: 'id, recipe_id, produto_norm'
    });
  }
}
export const db = new AppDB();
