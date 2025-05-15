import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Lightbulb, Globe } from "lucide-react"

export default function MissionValues() {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-orange-500" />,
      title: "Mission",
      description:
        "To create a global ecosystem where creative professionals can connect, collaborate, and thrive together.",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Community",
      description: "We believe in the power of community to inspire innovation and support professional growth.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-orange-500" />,
      title: "Innovation",
      description: "We encourage creative thinking and innovative approaches to solving challenges.",
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: "Inclusivity",
      description: "We're committed to creating an inclusive platform that welcomes diverse perspectives and talents.",
    },
  ]

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Mission & Values</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-orange-100 rounded-full">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
