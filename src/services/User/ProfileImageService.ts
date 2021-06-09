import path from 'path';
import fs from 'fs';
import { getRepository } from 'typeorm';

import User from '../../models/User';
import uploadConfig from '../../config/upload';
import AppError from '../../errors/AppError';

interface Request {
  user_id: number;
  fileName: string;
}

class ProfileImageService {
  async execute({ fileName, user_id }: Request): Promise<User> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(user_id);

    if (!user) {
      throw new AppError('Usuário inexistente', 400);
    }

    if (user?.profile_image) {
      const oldProfileImage = path.join(
        uploadConfig.directory,
        user.profile_image,
      );
      const fileExists = await fs.promises.stat(oldProfileImage);
      if (fileExists) {
        // remove old picture
        await fs.promises.unlink(oldProfileImage);
      }
    }

    user.profile_image = fileName;
    await userRepository.save(user);
    user.getUrl();

    return user;
  }
}

export default ProfileImageService;
