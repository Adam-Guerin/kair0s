import { Link } from 'react-router-dom'

export function LegalNavigation() {
  const legalPages = [
    { path: '/legal/terms-of-service', title: 'Terms of Service' },
    { path: '/legal/privacy-policy', title: 'Privacy Policy' },
    { path: '/legal/cookie-policy', title: 'Cookie Policy' },
    { path: '/legal/gdpr-compliance', title: 'GDPR Compliance' },
    { path: '/legal/disclaimer', title: 'Disclaimer' },
    { path: '/legal/legal-notices', title: 'Legal Notices' },
  ]

  return (
    <nav className="bg-card border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Legal Documents</h3>
      <ul className="space-y-2">
        {legalPages.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
