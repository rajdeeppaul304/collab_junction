import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function CategoryFilter({ categories }) {
  // Price ranges
  const priceRanges = [
    { id: "under-50", label: "Under $50" },
    { id: "50-100", label: "$50 - $100" },
    { id: "100-200", label: "$100 - $200" },
    { id: "over-200", label: "Over $200" },
  ]

  // Ratings
  const ratings = [
    { id: "4-up", label: "4 Stars & Up" },
    { id: "3-up", label: "3 Stars & Up" },
    { id: "2-up", label: "2 Stars & Up" },
    { id: "1-up", label: "1 Star & Up" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox id={`category-${category.id}`} />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">Price</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <Checkbox id={`price-${range.id}`} />
                  <Label htmlFor={`price-${range.id}`}>{range.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger className="text-lg font-semibold">Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating.id}`} />
                  <Label htmlFor={`rating-${rating.id}`}>{rating.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
