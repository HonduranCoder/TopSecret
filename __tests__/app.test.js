const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const Secret = require('../lib/models/Secret.js');
const UserService = require('../lib/services/UserService.js');
const req = require('express/lib/request');

const mockUser = {
  email: 'test@example.com',
  password: '12345',
};

const agent = request.agent(app);

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...mockUser, ...userProps });
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('backend routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });
  it('creates a new user with hashed password', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      email,
    });
  });
  //response = session object: id, email, token
  it('logs in a user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send(mockUser);

    expect(res.body).toEqual({
      message: 'Signed in successfully!',
    });
  });
  it('logs a user out', async () => {
    const res = await agent.delete('/api/v1/users/sessions').send(mockUser);

    expect(res.body).toEqual({
      success: true,
      message: 'Signed out successfully!',
    });
  });
  //test for creating a secret
  it('create a secret', async () => {
    const [agent, user] = await registerAndLogin();
    const res = await agent
      .post('/api/v1/secrets')
      .send({
        title: 'secret',
        description: 'secret, secret',
        createdAt: 'string',
      });

    expect(res.body).toEqual({
      id: expect.any(String),
      title: 'secret',
      description: 'secret, secret',
      createdAt: expect.any(String),
    });
  });
  it('list of secrets if signed in', async () => {
    const [agent, user] = await registerAndLogin();
    await agent.post('/api/v1/secrets').send({
      title: 'secret',
      description: 'secret, secret',
      createdAt: 'string',
    });

    const res = await agent.get('/api/v1/secrets');

    expect(res.body).toEqual([
      {
        id: expect.any(String),
        title: 'secret',
        description: 'secret, secret',
        createdAt: expect.any(String),
      },
    ]);
  });
});
