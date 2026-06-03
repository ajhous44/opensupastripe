import Image from "next/image"
import Section from "@/components/Section"

export type Feature = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  imageClassName?: string
  bullets: string[]
}

interface Props {
  features: Feature[]
}

/**
 * AlternatingFeatures – zig‑zag two‑column layout that flips image / text per row.
 * Redesigned with a premium, high-tech aesthetic for car organization owners.
 */
export default function AlternatingFeatures({ features }: Props) {
  return (
    <Section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 sm:mb-20 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center mb-4 rounded-full bg-gradient-to-r from-blue-600/10 to-violet-600/10 px-5 py-2 backdrop-blur-sm border border-blue-100">
            <span className="mr-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
            <span className="text-sm font-semibold text-gray-900 tracking-wide">BUILT FOR DEALERSHIPS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            A complete solution for your online presence
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Everything you need to succeed online, simplified into one powerful platform
          </p>
        </div>

        {/* Features */}
        <div className="space-y-10 sm:space-y-14">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              className="grid md:grid-cols-2 gap-8 sm:gap-10 items-center rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className={`${idx % 2 === 1 ? "md:order-2" : ""}`}>
                {feature.image && (
                  <div className={`relative overflow-hidden rounded-xl ${feature.id === 'google' ? 'bg-white' : 'bg-gray-100'}`}>
                    {feature.id === 'google' ? (
                      <div className="mx-auto max-w-[200px] sm:max-w-[250px]">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          width={375}
                          height={667}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    ) : (
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={800}
                        height={600}
                        className={`h-auto w-full ${feature.imageClassName ?? 'object-contain'}`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`${idx % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600 ring-1 ring-blue-100">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{feature.title}</h3>
                </div>
                <p className="mb-6 text-base sm:text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mt-1 mr-3 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L7.5 12.086l7.793-7.793a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-gray-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
