import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrderHistory() {
  // Sample order data
  const orders = [
    {
      id: "ORD-1234",
      date: "May 12, 2023",
      total: 149.99,
      status: "Completed",
      items: [{ id: 1, name: "Content Creation Bundle" }],
    },
    {
      id: "ORD-1235",
      date: "April 28, 2023",
      total: 99.99,
      status: "Completed",
      items: [{ id: 2, name: "Creative Design Package" }],
    },
    {
      id: "ORD-1236",
      date: "April 15, 2023",
      total: 279.98,
      status: "Completed",
      items: [
        { id: 3, name: "Marketing Strategy Session" },
        { id: 4, name: "Social Media Management" },
      ],
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order History</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <ul className="list-disc pl-5">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <Link href={`/product/${item.id}`} className="text-orange-500 hover:underline">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
