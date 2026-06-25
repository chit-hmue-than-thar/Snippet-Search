import type { Metadata } from "next";
import Header from "@/components/Header";
import ThemeRegistry from "@/components/ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snippet Search",
  description: "Search and manage text snippets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Header />
          <main>{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
