import { Geist_Mono, Inter } from "next/font/google";
import AuthListener from "@/components/AuthListener";
import "./globals.css";
import { QueryClientProviderComponent } from "@/providers/QueryClient";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
        <SidebarProvider>
          <QueryClientProviderComponent>
            <AuthListener />
            <AppSidebar />

            <div className="md:py-10 w-full">{children}</div>
          </QueryClientProviderComponent>
        </SidebarProvider>
      </body>
    </html>
  );
}
