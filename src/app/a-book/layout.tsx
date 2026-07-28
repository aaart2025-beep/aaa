import { Cormorant_Garamond } from "next/font/google";

/* Cormorant (the flipbook's display serif) is only used by the /a-book
 * experience, so it loads here instead of taxing every route. */
const bookDisplay = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function ABookLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${bookDisplay.variable} contents`}>{children}</div>;
}
