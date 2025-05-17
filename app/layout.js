"use client";
import './globals.css';
import { SessionProvider } from 'next-auth/react';



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
