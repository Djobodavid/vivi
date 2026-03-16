"use client";

import NavbarComponent from "./components/header";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";
import { AppProvider } from "./providers/app.context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cover bg-center">
        <AppProvider>
          <HeroUIProvider>
            <NavbarComponent />

            <main className="p-6 flex-1 overflow-auto">{children}</main>
          </HeroUIProvider>
        </AppProvider>
      </body>
    </html>
  );
}
