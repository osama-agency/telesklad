import "@/css/golos.css";
import "@/css/simple-datatables.css";
import "dropzone/dist/dropzone.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "nouislider/dist/nouislider.css";

import "@/css/telesklad.css";
import "@/css/satoshi.css";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | NextAdmin - Next.js Dashboard Kit",
    default: "NextAdmin - Next.js Dashboard Kit",
  },
  description:
    "Next.js admin dashboard toolkit with 200+ templates, UI components, and integrations for fast dashboard development.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <NextTopLoader 
            color="#1B6EF3" 
            showSpinner={false}
            height={3}
            crawl={true}
            crawlSpeed={200}
            initialPosition={0.08}
            easing="ease"
            speed={200}
            shadow="0 0 10px #1B6EF3,0 0 5px #1B6EF3"
            template='<div class="bar" role="bar"><div class="peg"></div></div>'
            zIndex={1600}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
