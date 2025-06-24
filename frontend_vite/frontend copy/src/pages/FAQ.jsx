"use client"

import { useState } from "react"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is Collab Junction?",
      answer:
        "Collab Junction is a platform that connects brands with creators for authentic product collaborations. We use AI to match brands with relevant micro-influencers, automating the collaboration process to generate authentic social proof and reach.",
    },
    {
      question: "How do I sign up as a creator?",
      answer:
        "To sign up as a creator, click on the 'Sign Up' button, fill in your details, and select 'Creator' as your role. You'll need to complete your profile with information about your niche, audience demographics, and social media accounts.",
    },
    {
      question: "How do I sign up as a brand?",
      answer:
        "To sign up as a brand, click on the 'Sign Up' button, fill in your details, and select 'Brand' as your role. You'll then be able to add your products and start connecting with relevant creators.",
    },
    {
      question: "How does the matching process work?",
      answer:
        "Our AI-powered algorithm analyzes creator profiles, content style, audience demographics, and engagement rates to match them with brands that align with their niche and values. This ensures authentic collaborations that resonate with audiences.",
    },
    {
      question: "Is there a fee to join?",
      answer:
        "Creators can join for free. Brands have flexible subscription options based on collaboration volume and feature requirements.",
    },
    {
      question: "How do creators get paid?",
      answer:
        "Creators can earn through various compensation models including free products, fixed fees, commission-based arrangements, or a combination. Payment terms are agreed upon between the brand and creator before collaboration begins.",
    },
    {
      question: "What types of products can brands list?",
      answer:
        "Brands can list a wide range of products including apparel, accessories, electronics, beauty products, home goods, and more. All products must comply with our community guidelines and terms of service.",
    },
    {
      question: "How do I track the performance of my collaborations?",
      answer:
        "Both creators and brands have access to detailed analytics dashboards that track engagement, reach, clicks, and conversion metrics for each collaboration.",
    },
  ]

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <Card key={index} className="mb-4 overflow-hidden">
              <button
                className="w-full p-6 text-left flex justify-between items-center"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="text-xl font-bold">{faq.question}</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div
                className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default FAQ
