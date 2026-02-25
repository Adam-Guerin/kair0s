import { createBrowserRouter } from 'react-router-dom'
import { LegalLayout } from './LegalLayout'
import { TermsOfService } from './TermsOfService'
import { PrivacyPolicy } from './PrivacyPolicy'
import { CookiePolicy } from './CookiePolicy'
import { GDPRCompliance } from './GDPRCompliance'
import { Disclaimer } from './Disclaimer'
import { LegalNotices } from './LegalNotices'

export const legalRoutes = createBrowserRouter([
  {
    path: '/legal',
    element: <LegalLayout />,
    children: [
      {
        index: true,
        element: <TermsOfService />,
      },
      {
        path: 'terms-of-service',
        element: <TermsOfService />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'cookie-policy',
        element: <CookiePolicy />,
      },
      {
        path: 'gdpr-compliance',
        element: <GDPRCompliance />,
      },
      {
        path: 'disclaimer',
        element: <Disclaimer />,
      },
      {
        path: 'legal-notices',
        element: <LegalNotices />,
      },
    ],
  },
])
