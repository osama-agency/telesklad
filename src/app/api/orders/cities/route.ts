import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

// GET - получение списка городов из заказов
export async function GET(request: NextRequest) {
  try {
    const cities = await (prisma as any).orders.groupBy({
      by: ['customercity'],
      where: {
        AND: [
          { customercity: { not: null } },
          { customercity: { not: "" } }
        ]
      },
      _count: {
        customercity: true
      },
      orderBy: {
        _count: {
          customercity: 'desc'
        }
      }
    });

    const formattedCities = cities.map((city: any) => ({
      value: city.customercity,
      label: city.customercity,
      count: city._count.customercity
    }));

    return NextResponse.json({
      cities: formattedCities
    });

  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 