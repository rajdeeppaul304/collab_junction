import './globals.css';
import Header from '../components/header'; // Adjust path as needed
import SessionWrapper from '../components/session-provider'; // Adjust path as needed
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Optional: Tailwind CDN (not needed if you're using Tailwind via PostCSS config) */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-black min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4">
          <SessionWrapper>
            <Header />
            {children}
          </SessionWrapper>
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
