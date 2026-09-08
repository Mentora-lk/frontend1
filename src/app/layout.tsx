import { ReactNode } from "react";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { GlobalThemeStyles } from "@/components/providers/GlobalThemeStyles";

export const metadata = {
  title: "frontend1",
  description: "Mentora landing scaffold",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <GlobalThemeStyles />
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
