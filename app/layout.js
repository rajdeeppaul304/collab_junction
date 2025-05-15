import "./globals.css"

import { ClerkProvider } from "@clerk/nextjs"
// import { Provider } from "@radix-ui/react-toast"
import  Provider  from "@/app/provider"



export const metadata = {
  title: "Collab Junction",
  description: "AI-Powered Authentic Branding",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* <script src="https://cdn.tailwindcss.com"></script> */}

        <body className="bg-black min-h-screen">
          <div className="max-w-7xl mx-auto px-4">
            <Provider>
              {children}

            </Provider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
