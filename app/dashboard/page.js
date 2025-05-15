import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      <div className="bg-[#111] rounded-3xl p-8">
        <p className="text-white text-xl mb-6">Welcome to your Collab Junction dashboard!</p>
        <div className="flex gap-4">
          <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
            <Link href="/profile">Go to Profile</Link>
          </Button>
          <Button asChild variant="outline" className="bg-white text-black hover:bg-gray-200">
            <Link href="/store">Browse Store</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
