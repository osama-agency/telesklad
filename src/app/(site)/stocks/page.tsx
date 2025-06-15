import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LatestTransaction } from "./_components/latest-transactions";
import { LatestTransactionsSkeleton } from "./_components/latest-transactions/skeleton";
import { MarketMovers } from "./_components/market-movers";
import { MarketMoversSkeleton } from "./_components/market-movers/skeleton";
import { MyStocks } from "./_components/my-stocks";
import { MyStocksSkeleton } from "./_components/my-stocks/skeleton";
import { TotalInvestment } from "./_components/total-investment";
import { TrendingStocks } from "./_components/trending-stocks";
import { StocksOverviewCarousel } from "./_components/trending-stocks-carousel";
import { getOverviewCarouselData } from "./fetch";

export const metadata: Metadata = {
  title: "Stocks Dashboard",
};

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function StocksPage(props: PropsType) {
  const { selected_time_frame } = await props.searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const carouselData = await getOverviewCarouselData();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-9">
      <StocksOverviewCarousel data={carouselData} />

      <TotalInvestment timeFrame={extractTimeFrame("total_investment")} />

      <Suspense
        key={extractTimeFrame("my_stocks")}
        fallback={<MyStocksSkeleton />}
      >
        <MyStocks timeFrame={extractTimeFrame("my_stocks")} />
      </Suspense>

      <TrendingStocks />

      <Suspense
        key={extractTimeFrame("latest_transactions")}
        fallback={<LatestTransactionsSkeleton />}
      >
        <LatestTransaction
          timeFrame={extractTimeFrame("latest_transactions")}
        />
      </Suspense>

      <Suspense fallback={<MarketMoversSkeleton />}>
        <MarketMovers />
      </Suspense>
    </div>
  );
}
