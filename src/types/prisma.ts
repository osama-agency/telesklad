import { Prisma } from '@prisma/client';

export type PrismaOrder = Prisma.ordersGetPayload<{
  include: {
    order_items: true;
  };
}>;

export type PrismaOrderItem = Prisma.order_itemsGetPayload<{}>;

export type OrderWhereInput = Prisma.ordersWhereInput;
export type OrderOrderByInput = Prisma.ordersOrderByWithRelationInput; 