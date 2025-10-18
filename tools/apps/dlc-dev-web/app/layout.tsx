import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DLC Dev Web - Admin Portal",
  description: "DLC Development Stack v1.0.0-alpha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
