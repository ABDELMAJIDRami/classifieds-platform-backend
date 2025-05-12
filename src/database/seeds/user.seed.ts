import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  
  // Check if default manager already exists
  const existingManager = await userRepository.findOne({
    where: { email: 'admin@classifieds.com' },
    relations: ['role'],
  });
  
  if (existingManager) {
    console.log('Default manager already seeded');
    return;
  }
  
  const managerRole = await roleRepository.findOne({
    where: { name: 'manager' },
  });
  
  if (!managerRole) {
    console.error('Manager role not found. Please seed roles first.');
    return;
  }
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const manager = userRepository.create({
    email: 'admin@classifieds.com',
    firstName: 'Admin',
    lastName: 'User',
    password: hashedPassword,
    role: managerRole,
    isActive: true,
  });
  
  await userRepository.save(manager);
  console.log('Default manager seeded successfully');
};