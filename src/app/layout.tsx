import { Geist_Mono, Inter } from "next/font/google";
import AuthListener from "@/components/AuthListener";
import "./globals.css";
import { QueryClientProviderComponent } from "@/providers/QueryClient";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProviderComponent>
          <AuthListener />
          <div className="md:p-10 w-full">{children}</div>
        </QueryClientProviderComponent>
      </body>
    </html>
  );
}
