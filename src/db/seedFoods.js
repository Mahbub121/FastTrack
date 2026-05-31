import { db } from './dexie';
import foodsData from '../data/bangladeshi-foods.json';

export async function seedFoods() {
  try {
    const count = await db.foodItems.count();
    if (count < foodsData.length) {
      console.log('Seeding database with Bangladeshi food items (updating)...');
      await db.foodItems.bulkPut(foodsData);
      console.log('Food seeding/update complete.');
    }
  } catch (error) {
    console.error('Error seeding food items:', error);
  }
}
