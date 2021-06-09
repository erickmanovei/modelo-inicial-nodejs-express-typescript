import request from 'supertest';
import { Connection, getRepository, getConnection } from 'typeorm';
import createConnection from '../database';

import User from '../models/User';

import app from '../app';

let connection: Connection;

describe('User', () => {
  beforeAll(async () => {
    connection = await createConnection('test-connection');

    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('DROP TABLE IF EXISTS migrations');

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    const mainConnection = getConnection();

    await connection.close();
    await mainConnection.close();
  });

  it('should be able to list users', async () => {
    await request(app).post('/users').send({
      name: 'Érick Nilson Sodré',
      email: 'erick@teste.com',
      password: '123',
    });

    await request(app).post('/users').send({
      name: 'Admin Sodré',
      email: 'admin@teste.com',
      password: '123',
    });

    const response = await request(app).get('/users');

    expect(response.body.transactions).toHaveLength(2);
  });

  it('should be able to create new transaction', async () => {
    const usersRepository = getRepository(User);

    const response = await request(app).post('/users').send({
      name: 'Ademar Sodré',
      email: 'ademar@teste.com',
      password: '123',
    });

    const user = await usersRepository.findOne({
      where: {
        name: 'Ademar Sodré',
      },
    });

    expect(user).toBeTruthy();

    expect(response.body).toMatchObject(
      expect.objectContaining({
        id: expect.any(Number),
      }),
    );
  });

  it('should be able to delete a transaction', async () => {
    const usersRepository = getRepository(User);

    const response = await request(app).post('/users').send({
      name: 'Rommel Saldanha',
      email: 'rommel@teste.com',
      password: '123',
    });

    await request(app).delete(`/users/${response.body.id}`);

    const user = await usersRepository.findOne(response.body.id);

    expect(user).toBeFalsy();
  });
});
