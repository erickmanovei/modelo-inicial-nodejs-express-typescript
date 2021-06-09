import { Router } from 'express';
import { getRepository } from 'typeorm';

import multer from 'multer';
import uploadConfig from '../config/upload';

import ProfileImageService from '../services/User/ProfileImageService';

import CreateUserService from '../services/User/CreateUserService';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import User from '../models/User';

const usersRouter = Router();
const upload = multer(uploadConfig);

usersRouter.post('/', async (request, response) => {
  try {
    const { name, email, password } = request.body;

    const createUser = new CreateUserService();
    const user = await createUser.execute({ name, email, password });

    return response.json({ user: { ...user, password: undefined } });
  } catch (err) {
    return response.status(400).json({
      error: err.message,
    });
  }
});

usersRouter.use(ensureAuthenticated);

usersRouter.get('/', async (request, response) => {
  try {
    const { page, perPage } = request.query;

    const selectedPage = parseInt(page as string, 10);
    const take = parseInt(perPage as string, 10);
    const skip = selectedPage * take - take;

    if (!page || !perPage) {
      return response.status(400).json({
        error:
          'Necessário informar o número da página e a quantidade de itens por página.',
      });
    }
    const userRepository = getRepository(User);
    const [rows, count] = await userRepository.findAndCount({
      select: ['id', 'name', 'email', 'profile_image'],
      skip,
      take,
    });

    return response.json({
      count,
      rows,
    });
  } catch (err) {
    return response.status(400).json({
      error: err.message,
    });
  }
});

usersRouter.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(id);
    if (!user) {
      return response.status(400).json({
        error: 'Usuário inexistente!',
      });
    }

    return response.json({ user: { ...user, password: undefined } });
  } catch (err) {
    return response.status(400).json({
      error: err.message,
    });
  }
});

usersRouter.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const userRepository = getRepository(User);
    const user = await userRepository.findOne(id);
    if (!user) {
      return response.status(400).json({
        error: 'Usuário inexistente!',
      });
    }

    await userRepository.update(id, request.body);
    const newUser = await userRepository.findOne(id);

    return response.json(newUser);
  } catch (err) {
    return response.status(400).json({
      error: err.message,
    });
  }
});

usersRouter.post(
  '/profileimage',
  upload.single('file'),
  async (request, response) => {
    const profileImage = new ProfileImageService();
    const transactions = await profileImage.execute({
      fileName: request.file.filename,
      user_id: request.user.id,
    });
    return response.json(transactions);
  },
);

export default usersRouter;
