import express from 'express';
import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '../helpers/error';
const prisma = new PrismaClient();

export const signUp = async (_req: express.Request, res: express.Response) => {
  try {
    const { fullName, email, password } = _req.body;
    const createdUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password,
      },
    });
    res.status(200).send({
      statusCode: 201,
      data: createdUser,
      message: 'User created successfully.',
    });
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const login = async (_req: express.Request, res: express.Response) => {
  try {
    const { email, password } = _req.body;
    const user = await prisma.user.findFirst({
      where: {
        email,
        password,
      },
      select: {
        password: false,
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      res.status(200).send({ data: user, statusCode: 200, message: 'Login successfully.' });
    } else {
      res.status(400).send({
        statusCode: 400,
        message: 'Invalid Credentials',
      });
    }
  } catch (error) {
    handlePrismaError(error, res);
  }
};
