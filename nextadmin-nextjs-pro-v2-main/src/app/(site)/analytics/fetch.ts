export async function getTopProducts() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      image: "/images/product/product-01.png",
      name: "Apple Watch Series 7",
      category: "Electronics",
      price: 296,
      sold: 22,
      profit: 45,
    },
    {
      image: "/images/product/product-02.png",
      name: "Macbook Pro M1",
      category: "Electronics",
      price: 546,
      sold: 12,
      profit: 125,
    },
    {
      image: "/images/product/product-03.png",
      name: "Dell Inspiron 15",
      category: "Electronics",
      price: 443,
      sold: 64,
      profit: 247,
    },
    {
      image: "/images/product/product-04.png",
      name: "HP Probook 450",
      category: "Electronics",
      price: 499,
      sold: 72,
      profit: 103,
    },
  ];
}

export async function getTopContents() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      url: "/",
      views: 2500,
      uniques: 2100,
    },
    {
      url: "/blog/",
      views: 376,
      uniques: 139,
    },
    {
      url: "/reserve/success",
      views: 468,
      uniques: 290,
    },
    {
      url: "/product/product-details",
      views: 298,
      uniques: 176,
    },
    {
      url: "/blog/digital-marketing",
      views: 179,
      uniques: 57,
    },
  ];
}

export async function getTopChannels() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      name: "Google",
      views: 4200,
      uniques: 3800,
    },
    {
      name: "GitHub",
      views: 1900,
      uniques: 509,
    },
    {
      name: "Product Hunt",
      views: 1500,
      uniques: 986,
    },
    {
      name: "Facebook",
      views: 974,
      uniques: 639,
    },
    {
      name: "Twitter",
      views: 179,
      uniques: 57,
    },
  ];
}

export async function getTopCountries() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      flag: "/images/country/country-01.svg",
      percentage: 35,
      name: "United States",
    },
    {
      flag: "/images/country/country-02.svg",
      percentage: 26,
      name: "Canada",
    },
    {
      flag: "/images/country/country-03.svg",
      percentage: 18,
      name: "France",
    },
    {
      flag: "/images/country/country-04.svg",
      percentage: 14,
      name: "Italy",
    },
    {
      flag: "/images/country/country-05.svg",
      percentage: 10,
      name: "Australia",
    },
    {
      flag: "/images/country/country-06.svg",
      percentage: 7,
      name: "India",
    },
  ];
}