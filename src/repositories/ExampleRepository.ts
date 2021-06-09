import { EntityRepository, Repository, getRepository } from 'typeorm';

import User from '../models/User';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(User)
class ExampleRepository extends Repository<User> {
  public async getUsers(): Promise<User[]> {
    const userRepository = getRepository(User);
    const users = await userRepository.find();
    return users;
  }
}

export default ExampleRepository;
