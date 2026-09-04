import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "[NEWS BRAND NAME]",
  description: "A newspaper redesigned for the interactive age.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
