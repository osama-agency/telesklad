export async function getMostUsedResources() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      icon: "/images/brand/google-analytics.svg",
      title: "Google Analytics",
      link: "#",
    },
    {
      icon: "/images/brand/facebook.svg",
      title: "Facebook Ads",
      link: "#",
    },
    {
      icon: "/images/brand/seranking.svg",
      title: "Seranking",
      link: "#",
    },
    {
      icon: "/images/brand/instagram.svg",
      title: "Instagram Ads",
      link: "#",
    },
  ];
}
