import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export const seedRoles = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  
  // Check if roles already exist
  const existingRoles = await roleRepository.find();
  if (existingRoles.length > 0) {
    console.log('Roles already seeded');
    return;
  }
  
  const roles = [
    {
      name: 'manager',
      description: 'Admin user who can manage the platform and moderate ads',
    },
    {
      name: 'member',
      description: 'Regular user who can create and manage their own ads',
    },
  ];
  
  await roleRepository.save(roles);
  console.log('Roles seeded successfully');
};