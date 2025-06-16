export async function getMarketMoversData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      symbol: "APPL",
      name: "Apple Inc.",
      price: 6426.0,
      changeRate: 28.5,
      returnRate: 6.5,
      volume: 12432.4,
    },
    {
      symbol: "TTE",
      name: "Twitter / X",
      price: 6426.0,
      changeRate: 320.98,
      returnRate: 12.6,
      volume: 12432.4,
    },
    {
      symbol: "BS",
      name: "Bootstrap.com",
      price: 6426.0,
      changeRate: 184.9,
      returnRate: 9.5,
      volume: 12432.4,
    },
    {
      symbol: "NFLX",
      name: "Netflix.com Inc",
      price: 6426.0,
      changeRate: -32.0,
      returnRate: -3.1,
      volume: 12432.4,
    },
    {
      symbol: "MS",
      name: "Microsoft Inc",
      price: 6426.0,
      changeRate: -52.0,
      returnRate: -1.5,
      volume: 12432.4,
    },
    {
      symbol: "LM",
      name: "Loom Inc",
      price: 6426.0,
      changeRate: 423.5,
      returnRate: 4.2,
      volume: 12432.4,
    },
  ];
}

export async function getOverviewCarouselData() {
  return [
    {
      image: "/images/brand/brand-07.svg",
      name: "Apple",
      share: 410.5,
      returnRate: -1.1,
    },
    {
      image: "/images/brand/brand-08.svg",
      name: "Meta",
      share: 157.36,
      returnRate: -0.1,
    },
    {
      image: "/images/brand/brand-09.svg",
      name: "Google",
      share: 743.76,
      returnRate: +0.95,
    },
    {
      image: "/images/brand/brand-10.svg",
      name: "Tesla",
      share: 234.09,
      returnRate: -1.1,
    },
    {
      image: "/images/brand/brand-11.svg",
      name: "Microsoft",
      share: 410.5,
      returnRate: -2.9,
    },
    {
      image: "/images/brand/brand-12.svg",
      name: "Amazon",
      share: 743.76,
      returnRate: +0.65,
    },
  ];
}

export async function getLatestTransactionsData(days = 7) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/brand/brand-15.svg",
      name: "Apple Inc.",
      interestRate: 3.8,
      returnRate: +3.69,
      price: 9346.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-17.svg",
      name: "Amazon",
      interestRate: 2.7,
      returnRate: +3.69,
      price: 6879.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-14.svg",
      name: "Netflix",
      interestRate: 2.5,
      returnRate: -3.69,
      price: -1439.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-18.svg",
      name: "IBM",
      interestRate: 1.8,
      returnRate: -3.69,
      price: -2329.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-16.svg",
      name: "Meta",
      interestRate: 3.7,
      returnRate: +3.69,
      price: 1026.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-19.svg",
      name: "Microsoft",
      interestRate: 3.7,
      returnRate: +3.69,
      price: 3226.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-20.svg",
      name: "Tesla",
      interestRate: 3.7,
      returnRate: -1.24,
      price: -6426.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-15.svg",
      name: "Apple Inc.",
      interestRate: 3.8,
      returnRate: +3.69,
      price: 9346.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-17.svg",
      name: "Amazon",
      interestRate: 2.7,
      returnRate: +3.69,
      price: 6879.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-14.svg",
      name: "Netflix",
      interestRate: 2.5,
      returnRate: -3.69,
      price: -1439.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-18.svg",
      name: "IBM",
      interestRate: 1.8,
      returnRate: -3.69,
      price: -2329.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-16.svg",
      name: "Meta",
      interestRate: 3.7,
      returnRate: +3.69,
      price: 1026.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-19.svg",
      name: "Microsoft",
      interestRate: 3.7,
      returnRate: +3.69,
      price: 3226.0,
      date: "2024-12-25T17:07:46.030Z",
    },
    {
      image: "/images/brand/brand-20.svg",
      name: "Tesla",
      interestRate: 3.7,
      returnRate: -1.24,
      price: -6426.0,
      date: "2024-12-25T17:07:46.030Z",
    },
  ].slice(0, days);
}

export async function getMyStocksData(categorizeBy?: string) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (categorizeBy === "yearly") {
    return [
      {
        image: "/images/brand/brand-07.svg",
        name: "Apple Inc",
        share: 160,
        price: 4000.5,
        returnRate: 0.95,
      },
      {
        image: "/images/brand/brand-01.svg",
        name: "Google",
        share: 1000,
        price: 4000.5,
        returnRate: 0.95,
      },
      {
        image: "/images/brand/brand-10.svg",
        name: "Tesla",
        share: 200,
        price: 4000.5,
        returnRate: 0.95,
      },
      {
        image: "/images/brand/brand-13.svg",
        name: "X.com",
        share: 870,
        price: 4000.5,
        returnRate: -0.95,
      },
      {
        image: "/images/brand/brand-11.svg",
        name: "Microsoft",
        share: 370,
        price: 4000.5,
        returnRate: 0.95,
      },
    ];
  }

  return [
    {
      image: "/images/brand/brand-07.svg",
      name: "Apple Inc",
      share: 16,
      price: 410.5,
      returnRate: 0.95,
    },
    {
      image: "/images/brand/brand-01.svg",
      name: "Google",
      share: 100,
      price: 410.5,
      returnRate: 0.95,
    },
    {
      image: "/images/brand/brand-10.svg",
      name: "Tesla",
      share: 20,
      price: 410.5,
      returnRate: 0.95,
    },
    {
      image: "/images/brand/brand-13.svg",
      name: "X.com",
      share: 87,
      price: 410.5,
      returnRate: -0.95,
    },
    {
      image: "/images/brand/brand-11.svg",
      name: "Microsoft",
      share: 37,
      price: 410.5,
      returnRate: 0.95,
    },
  ];
}

export async function getTrendingStocksData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/brand/brand-14.svg",
      name: "Netflix",
      gross: 12453.0,
      price: 1984.0,
      returnRate: 0.14,
    },
    {
      image: "/images/brand/brand-15.svg",
      name: "Apple Inc.",
      gross: 132453,
      price: 2634,
      returnRate: 1.03,
    },
    {
      image: "/images/brand/brand-16.svg",
      name: "Meta",
      gross: 31428,
      price: 2432,
      returnRate: 0.08,
    },
  ];
}