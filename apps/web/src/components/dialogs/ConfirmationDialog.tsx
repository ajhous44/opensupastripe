'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  confirmButtonStyle?: string
  requireConfirmText?: string // when provided, user must type this to enable confirm
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonStyle = 'bg-red-600 hover:bg-red-700',
  requireConfirmText = ''
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [typed, setTyped] = useState('')

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onCancel])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const needsTyping = Boolean(requireConfirmText)
  const isConfirmEnabled = !needsTyping || (typed.trim().toLowerCase() === requireConfirmText.trim().toLowerCase())

  const renderMessage = () => {
    if (typeof message === 'string') {
      const normalized = message.replace(/\n+/g, ' ')
      return <p className="m-0">{normalized}</p>
    }
    return message
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div ref={dialogRef} className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500 mb-4">{renderMessage()}</div>
        {needsTyping && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type "{requireConfirmText}" to confirm
            </label>
            <input
              aria-label={`Type ${requireConfirmText} to confirm`}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireConfirmText}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
            />
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!isConfirmEnabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isConfirmEnabled ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'} ${confirmButtonStyle}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
} 
