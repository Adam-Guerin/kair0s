import { Container, Header, Sidebar } from '../../components'

export function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <Container className="flex-1">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Kair0s uses cookies for several purposes to enhance your experience and improve our service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Essential cookies for website functionality</li>
                  <li>Authentication and session management</li>
                  <li>User preferences and settings</li>
                  <li>Analytics and performance monitoring</li>
                  <li>Security and fraud prevention</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are necessary for the website to function and cannot be switched off in our systems. They enable basic functions like page navigation, access to secure areas, and authentication.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Performance Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the performance and user experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Functional Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings to provide a more customized experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Security Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are used for security purposes, including fraud detection and prevention, and to protect our service and users from malicious activities.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We may use third-party services that set their own cookies on your device. These include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>AI model providers for processing requests</li>
                  <li>Analytics services for website performance</li>
                  <li>Security services for fraud prevention</li>
                  <li>Payment processors for subscription management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Managing Your Cookie Preferences</h2>
                <p className="text-muted-foreground mb-4">
                  You have several options for managing cookies:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Accept or reject cookies through our cookie consent banner</li>
                  <li>Adjust your browser settings to block or delete cookies</li>
                  <li>Clear cookies from your device at any time</li>
                  <li>Use browser extensions to manage cookie preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookie Duration</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Persistent Cookies:</strong> These remain on your device for a specified period or until you delete them.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Accept or reject non-essential cookies</li>
                  <li>Withdraw consent at any time</li>
                  <li>Access information about cookies we use</li>
                  <li>Request deletion of your data collected via cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Impact of Disabling Cookies</h2>
                <p className="text-muted-foreground">
                  Disabling cookies may affect your experience on our website. Some features may not function properly, and you may need to re-enter preferences or login information more frequently.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our use of cookies or applicable laws. We will notify you of any significant changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Cookie Policy, please contact us at privacy@kair0s.com
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
