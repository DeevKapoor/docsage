"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryPoint {
  id: number
  title: string
  points: string[]
}

interface SummaryOutputProps {
  summary: SummaryPoint[]
}

export default function SummaryOutput({ summary }: SummaryOutputProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {summary.map((section) => (
        <motion.div key={section.id} variants={item}>
          <Card className="overflow-hidden backdrop-blur-sm bg-card/70 border border-muted">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-serif">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {section.points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

