'use client'

import { useState } from 'react'

export type FaqItem = {
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="divide-y divide-line">
      {items.map((item, index) => {
        const open = openIndex === index
        const panelId = `faq-panel-${index}`
        const buttonId = `faq-trigger-${index}`

        return (
          <div key={item.question}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span className="text-[0.9375rem] font-medium text-foreground">{item.question}</span>
                <span className="shrink-0 text-sm text-muted-foreground" aria-hidden>
                  {open ? '−' : '+'}
                </span>
              </button>
            </h3>
            <section id={panelId} aria-labelledby={buttonId} hidden={!open}>
              {open ? (
                <p className="pb-6 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              ) : null}
            </section>
          </div>
        )
      })}
    </div>
  )
}
