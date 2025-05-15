import "./globals.css"
import Header from "@/components/header"

export const metadata = {
  title: "Collab Junction",
  description: "AI-Powered Authentic Branding",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        {/* <script src="https://cdn.tailwindcss.com"></script> */}

      <body className="bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
