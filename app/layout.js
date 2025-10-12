import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner"; // ✅ correct import

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FINANCE TRACKER",
  description: "One stop Finance Platform",
  icons: {
    icon: "/logo-sm.png",
  },
};

export default function RootLayout({ children }) {
  return (
   
      <html lang="en">
        {/* <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head> */}
        <body className={`${inter.className}`}>
        <ClerkProvider>
          <Header />
          <main className="min-h-screen">{children}</main>

          {/* ✅ Sonner toaster */}
          <Toaster richColors />

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made for Finance tracking</p>
            </div>
          </footer>
          </ClerkProvider>
        </body>
      </html>
   
  );
}
