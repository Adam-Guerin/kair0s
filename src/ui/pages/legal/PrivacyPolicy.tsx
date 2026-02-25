import { Container, Header, Sidebar } from '../../components'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <Container className="flex-1">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Kair0s ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Gateway service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Name and email address</li>
                      <li>Account credentials</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Usage Data</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>AI model interactions and queries</li>
                      <li>Service usage patterns and statistics</li>
                      <li>Performance and error logs</li>
                      <li>Device and browser information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Technical Data</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>IP address and location data</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>System configuration and performance metrics</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide and maintain our AI Gateway service</li>
                  <li>Process and respond to your AI model requests</li>
                  <li>Improve service performance and user experience</li>
                  <li>Monitor usage patterns for optimization</li>
                  <li>Communicate with you about service updates</li>
                  <li>Ensure security and prevent fraudulent activities</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>With AI model providers for processing your requests</li>
                  <li>With trusted service providers who assist in operating our service</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transaction (merger, acquisition)</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These include encryption, secure authentication, regular security audits, and employee training.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information only as long as necessary to provide our services and comply with legal obligations. AI query data may be retained for service improvement and security purposes, with appropriate anonymization where possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your information</li>
                  <li>Restriction of processing</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in accordance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete it immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at privacy@kair0s.com
                </p>
              </section>

              <section>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </section>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
