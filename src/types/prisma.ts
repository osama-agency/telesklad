import { Prisma } from '@prisma/client';

export type PrismaOrder = Prisma.OrderGetPayload<{
  include: {
    order_items: true;
  };
}>;

export type PrismaOrderItem = Prisma.OrderItemGetPayload<{}>;

export type PrismaOrderWhereInput = Prisma.OrderWhereInput;
export type PrismaOrderOrderByWithRelationInput = Prisma.OrderOrderByWithRelationInput; 