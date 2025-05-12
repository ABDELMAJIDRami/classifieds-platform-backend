import { DataSource } from 'typeorm';
import { seedRoles } from './role.seed';
import { seedUsers } from './user.seed';

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  try {
    // Run seeds in order
    await seedRoles(dataSource);
    await seedUsers(dataSource);
    
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  }
};