export async function getTopChannels() {
  // Fake delay for demo
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Telegram Bot",
      views: 15420,
      uniques: 8230,
    },
    {
      name: "Web Interface",
      views: 12350,
      uniques: 6890,
    },
    {
      name: "Mobile App",
      views: 9870,
      uniques: 5670,
    },
    {
      name: "API Calls",
      views: 7540,
      uniques: 4320,
    },
    {
      name: "Direct Access",
      views: 5210,
      uniques: 3450,
    },
  ];
}

export async function getTopContents() {
  // Fake delay for demo
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return [
    {
      name: "Товарная аналитика",
      views: 25430,
      uniques: 12840,
    },
    {
      name: "Прогнозы продаж",
      views: 18920,
      uniques: 9560,
    },
    {
      name: "ABC/XYZ анализ",
      views: 15670,
      uniques: 8230,
    },
    {
      name: "Рекомендации закупок",
      views: 12450,
      uniques: 6780,
    },
    {
      name: "Отчеты по маржинальности",
      views: 9840,
      uniques: 5420,
    },
  ];
}

export async function getTopCountries() {
  // Fake delay for demo
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    {
      name: "Россия",
      code: "RU",
      visitors: 45230,
      percentage: 42.5,
    },
    {
      name: "Казахстан",
      code: "KZ", 
      visitors: 18940,
      percentage: 17.8,
    },
    {
      name: "Беларусь",
      code: "BY",
      visitors: 12670,
      percentage: 11.9,
    },
    {
      name: "Украина",
      code: "UA",
      visitors: 8450,
      percentage: 7.9,
    },
    {
      name: "Другие",
      code: "OTHER",
      visitors: 21210,
      percentage: 19.9,
    },
  ];
}

export async function getTopProducts() {
  // Fake delay for demo
  await new Promise((resolve) => setTimeout(resolve, 900));

  return [
    {
      id: 1,
      name: "Смартфон Galaxy S24",
      category: "Электроника",
      price: 699,
      sold: 1250,
      profit: 87500,
      image: "/images/product/product-01.png",
    },
    {
      id: 2,
      name: "Ноутбук MacBook Air",
      category: "Компьютеры",
      price: 1399,
      sold: 890,
      profit: 123450,
      image: "/images/product/product-02.png",
    },
    {
      id: 3,
      name: "Наушники AirPods Pro",
      category: "Аксессуары",
      price: 199,
      sold: 2150,
      profit: 43000,
      image: "/images/product/product-03.png",
    },
    {
      id: 4,
      name: "Планшет iPad",
      category: "Электроника",
      price: 599,
      sold: 650,
      profit: 39000,
      image: "/images/product/product-04.png",
    },
    {
      id: 5,
      name: "Умные часы Apple Watch",
      category: "Аксессуары",
      price: 399,
      sold: 1780,
      profit: 71200,
      image: "/images/product/product-05.png",
    },
  ];
}