'use client'

import { useState, useCallback } from 'react'
import { submitContactForm } from '@/app/actions/contact'

const MAX_MESSAGE_LENGTH = 2000

export default function ContactForm() {
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [renderTimestamp] = useState(() => Date.now()) // Time-based honeypot
	const [message, setMessage] = useState('')
	const [phone, setPhone] = useState('')
	const [subject, setSubject] = useState("I'm interested in signing up")

	const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setSuccess(false)
		setLoading(true)

		try {
			const form = e.currentTarget
			const data = new FormData(form)
			
			// Prepare form data for server action
			const formData = {
				'first-name': String(data.get('first-name') || '').trim(),
				'last-name': String(data.get('last-name') || '').trim(),
				email: String(data.get('email') || '').trim(),
				phone: phone || '',
				subject: subject || String(data.get('subject') || ''),
				message: message.trim(),
				timestamp: renderTimestamp,
			}

			const result = await submitContactForm(formData)

			if (result.success) {
				setSuccess(true)
				setMessage('')
				setPhone('')
				setSubject("I'm interested in signing up")
				form.reset()
				// Reset timestamp for next submission
				// Note: This will create a new timestamp on next render, but that's fine
			} else {
				setError(result.error?.message || 'Failed to send message. Please try again.')
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.')
			console.error('Contact form error:', err)
		} finally {
			setLoading(false)
		}
	}, [renderTimestamp, message, phone, subject])

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
						First name
					</label>
					<div className="mt-1">
						<input
							type="text"
							name="first-name"
							id="first-name"
							autoComplete="given-name"
							required
							className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
					</div>
				</div>
				<div>
					<label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
						Last name
					</label>
					<div className="mt-1">
						<input
							type="text"
							name="last-name"
							id="last-name"
							autoComplete="family-name"
							required
							className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
					</div>
				</div>
			</div>

			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					Email
				</label>
				<div className="mt-1">
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
				</div>
			</div>

			<div>
				<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
					Phone Number <span className="text-gray-400 font-normal">(optional)</span>
				</label>
				<div className="mt-1">
					<input
						type="tel"
						name="phone"
						id="phone"
						autoComplete="tel"
						value={phone}
						onChange={(e) => {
							// Only allow numbers, spaces, dashes, parentheses, and plus sign
							const value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '')
							setPhone(value)
						}}
						className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
				</div>
			</div>

			<div>
				<label htmlFor="subject" className="block text-sm font-medium text-gray-700">
					Subject
				</label>
				<div className="mt-1">
					<select
						name="subject"
						id="subject"
						required
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					>
						<option value="I'm interested in signing up">I'm interested in signing up</option>
						<option value="I have a technical question">I have a technical question</option>
					</select>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<label htmlFor="message" className="block text-sm font-medium text-gray-700">
						Message
					</label>
					<span className={`text-sm ${message.length > MAX_MESSAGE_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
						{message.length} / {MAX_MESSAGE_LENGTH}
					</span>
				</div>
				<div className="mt-1">
					<textarea
						id="message"
						name="message"
						rows={4}
						required
						value={message}
						onChange={(e) => {
							if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
								setMessage(e.target.value)
							}
						}}
						maxLength={MAX_MESSAGE_LENGTH}
						className="block w-full rounded-md border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
				</div>
			</div>

			{error && (
				<div className="rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-red-800">{error}</p>
						</div>
					</div>
				</div>
			)}

			{success && (
				<div className="rounded-md bg-green-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-green-800">
								Thank you! Your message has been sent. We&apos;ll get back to you soon.
							</p>
						</div>
					</div>
				</div>
			)}

			<div>
				<button
					type="submit"
					disabled={loading}
					className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Sending...' : 'Send Message'}
				</button>
			</div>
		</form>
	)
}


