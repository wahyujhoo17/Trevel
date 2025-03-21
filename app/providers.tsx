"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false} // Disable system theme
      forcedTheme="light" // Force light theme
    >
      {children}
    </ThemeProvider>
  );
}
