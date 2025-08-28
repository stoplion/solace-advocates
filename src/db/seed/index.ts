import db from "../index";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Clear existing data
    await db.delete(advocates);
    
    // Insert seed data
    await db.insert(advocates).values(advocateData);
    
    console.log(`✅ Seeded ${advocateData.length} advocates`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();