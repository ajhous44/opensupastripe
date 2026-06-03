'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/lib/hooks'
import { normalizeUsState, normalizeUsZip } from '@/lib/us-states'

interface Suggestion {
  properties: {
    name: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  formatted: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (streetAddress: string, addressParts?: {
    street?: string,
    city?: string,
    state?: string,
    zip?: string
  }) => void
  placeholder?: string
  className?: string
  name?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter an address',
  className = '',
  name,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const debouncedValue = useDebounce(isUserTyping ? inputValue : value, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const displayedValue = isUserTyping ? inputValue : value
  const visibleSuggestions = isUserTyping ? suggestions : []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsUserTyping(true)
    onChange(e.target.value)
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const props = suggestion.properties

    let streetAddress = ''
    if (props.street) {
      streetAddress = props.housenumber ? `${props.housenumber} ${props.street}` : props.street
    } else if (props.name) {
      streetAddress = props.name
    }

    const addressParts = {
      street: streetAddress,
      city: props.city || '',
      state: props.state ? normalizeUsState(props.state) : '',
      zip: props.postcode ? normalizeUsZip(props.postcode) : '',
    }

    onChange(streetAddress, addressParts)
    setInputValue(streetAddress)
    setShowSuggestions(false)
    setIsUserTyping(false)
  }

  useEffect(() => {
    if (!isUserTyping) {
      return
    }

    const fetchSuggestions = async () => {
      if (debouncedValue.length < 3) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(debouncedValue)}&limit=5`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        const formattedSuggestions = data.features.map((feature: {
          properties: {
            name?: string
            street?: string
            housenumber?: string
            city?: string
            state?: string
            postcode?: string
            country?: string
          }
        }) => {
          const props = feature.properties
          const parts = []

          if (props.name) parts.push(props.name)
          if (props.street) {
            if (props.housenumber) {
              parts.push(`${props.housenumber} ${props.street}`)
            } else {
              parts.push(props.street)
            }
          }
          if (props.city) parts.push(props.city)
          if (props.state) parts.push(props.state)
          if (props.postcode) parts.push(props.postcode)
          if (props.country) parts.push(props.country)

          return {
            properties: props,
            formatted: parts.join(', '),
          }
        })

        setSuggestions(formattedSuggestions)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedValue, isUserTyping])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={displayedValue}
        onChange={handleInputChange}
        onFocus={() => isUserTyping && inputValue.length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 ${className}`}
      />

      {loading ? (
        <div className="absolute right-3 top-2">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
      ) : null}

      {showSuggestions && visibleSuggestions.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {visibleSuggestions.map((suggestion, index) => {
            const props = suggestion.properties
            let streetAddress = ''
            if (props.street) {
              streetAddress = props.housenumber ? `${props.housenumber} ${props.street}` : props.street
            } else if (props.name) {
              streetAddress = props.name
            }

            const locationParts = []
            if (props.city) locationParts.push(props.city)
            if (props.state) locationParts.push(normalizeUsState(props.state))
            if (props.postcode) locationParts.push(normalizeUsZip(props.postcode))
            const locationString = locationParts.join(', ')

            return (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {streetAddress || 'Address'}
                  </div>
                  {locationString ? (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {locationString}
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
