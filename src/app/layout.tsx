import { ReactNode } from "react";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";

export const metadata = {
  title: "frontend1",
  description: "Mentora landing scaffold",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <GoogleAuthProvider>{children}</GoogleAuthProvider>
      </body>
    </html>
  );
}
