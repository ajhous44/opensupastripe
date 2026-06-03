import { DASHBOARD_PAGE_GUTTER } from '@/lib/dashboard-page-gutter'

export const metadata = {
  title: 'Settings | My Company Dashboard',
  description: 'Organization settings',
}

export default function SettingsPage() {
  return (
    <div className={`p-6 ${DASHBOARD_PAGE_GUTTER}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your organization profile, branding, and preferences. More settings coming soon.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Coming soon</h2>
        <p className="mt-2 text-sm text-gray-600">
          Organization name, logo, subdomain, and notification preferences will be managed here.
        </p>
      </div>
    </div>
  )
}
