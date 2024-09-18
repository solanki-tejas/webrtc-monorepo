import express from 'express';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

export class ErrorHandler extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const handleError = (err: ErrorHandler, res: express.Response): void => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

export const handlePrismaError = (error: unknown, res: Response) => {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        const fields = target.join(', ');
        return res.status(409).json({
          message: `Unique constraint failed on the ${fields ? `field(s): ${fields}` : 'constraint'}`,
          error: 'UniqueConstraintViolation',
          fields: target,
        });
      }
      case 'P2014':
        return res.status(400).json({
          message: 'The change you are trying to make would violate the required relation between the models',
          error: 'RelationViolation',
        });
      case 'P2003': {
        const field = (error.meta?.field_name as string) || 'unknown';
        return res.status(400).json({
          message: `Foreign key constraint failed on the field: ${field}`,
          error: 'ForeignKeyViolation',
          field,
        });
      }
      case 'P2025':
        return res.status(404).json({
          message: 'Record to update not found',
          error: 'NotFound',
        });
      default:
        return res.status(500).json({
          message: 'An unexpected database error occurred',
          error: 'DatabaseError',
        });
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'The provided data is invalid',
      error: 'ValidationError',
    });
  } else if (error instanceof Error) {
    return res.status(500).json({
      message: error.message || 'An unexpected error occurred',
      error: 'UnknownError',
    });
  }

  return res.status(500).json({
    message: 'An unexpected error occurred',
    error: 'UnknownError',
  });
};
