import { Container, Header, Sidebar } from '../../components'

export function GDPRCompliance() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <Container className="flex-1">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-bold text-foreground mb-8">GDPR Compliance</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. GDPR Overview</h2>
                <p className="text-muted-foreground">
                  The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. It strengthens and unifies data protection for individuals within the European Union (EU) and the European Economic Area (EEA).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Our Commitment to GDPR</h2>
                <p className="text-muted-foreground mb-4">
                  Kair0s is fully committed to GDPR compliance and protecting the personal data of our users. We have implemented comprehensive measures to ensure:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Lawful, fair, and transparent data processing</li>
                  <li>Clear purposes for data collection and processing</li>
                  <li>Data minimization and accuracy</li>
                  <li>Limited retention periods</li>
                  <li>Robust security measures</li>
                  <li>Accountability and documentation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
                <p className="text-muted-foreground mb-4">
                  We process personal data based on the following legal grounds under GDPR:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Consent:</strong> When you explicitly agree to our processing of your data</li>
                  <li><strong>Contractual Necessity:</strong> To provide our AI Gateway services</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                  <li><strong>Legitimate Interest:</strong> For purposes that are not overridden by your interests</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Subject Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Under GDPR, you have the following rights regarding your personal data:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Access</h3>
                    <p className="text-muted-foreground">
                      You can request a copy of your personal data that we hold, including information about how we process it.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Rectification</h3>
                    <p className="text-muted-foreground">
                      You can request correction of inaccurate or incomplete personal data.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Erasure</h3>
                    <p className="text-muted-foreground">
                      You can request deletion of your personal data in certain circumstances.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Restrict Processing</h3>
                    <p className="text-muted-foreground">
                      You can request limitation of how we process your personal data.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Data Portability</h3>
                    <p className="text-muted-foreground">
                      You can request transfer of your data to another service provider.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Object</h3>
                    <p className="text-muted-foreground">
                      You can object to processing based on legitimate interest or direct marketing.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Rights Related to Automated Decision-Making</h3>
                    <p className="text-muted-foreground">
                      You have rights regarding automated individual decision-making and profiling.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Processing Activities</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">User Account Management</h3>
                    <p className="text-muted-foreground">
                      Processing personal information to create and manage user accounts, including authentication and authorization.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">AI Service Delivery</h3>
                    <p className="text-muted-foreground">
                      Processing queries and interactions with AI models to provide our gateway services.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Service Improvement</h3>
                    <p className="text-muted-foreground">
                      Analyzing usage patterns and feedback to improve our services and user experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Security and Fraud Prevention</h3>
                    <p className="text-muted-foreground">
                      Monitoring activities to prevent unauthorized access and protect our services.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Protection Measures</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Encryption of data at rest and in transit</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection</li>
                  <li>Data breach detection and response procedures</li>
                  <li>Privacy by design and by default principles</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  We may transfer personal data outside the EU/EEA. We ensure such transfers are protected by:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Adequacy decisions from the European Commission</li>
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Binding Corporate Rules (BCRs)</li>
                  <li>Other appropriate safeguards under GDPR</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Breach Notification</h2>
                <p className="text-muted-foreground">
                  In the event of a personal data breach, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, unless the breach is unlikely to result in a risk to individuals' rights and freedoms. We will also notify affected individuals if the breach is likely to result in a high risk to their rights and freedoms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Protection Officer</h2>
                <p className="text-muted-foreground">
                  We have appointed a Data Protection Officer (DPO) to oversee our data protection activities and ensure GDPR compliance. You can contact our DPO at dpo@kair0s.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Exercising Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  To exercise your GDPR rights, please contact us at:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Email: privacy@kair0s.com</li>
                  <li>Phone: +1-555-GDPR-HELP</li>
                  <li>Mail: Kair0s GDPR Team, 123 Privacy Street, EU-1000</li>
                </ul>
                <p className="text-muted-foreground">
                  We will respond to your request within one month of receipt, unless the request is complex, in which case we may extend this period by up to two months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Complaints</h2>
                <p className="text-muted-foreground">
                  If you believe we have not complied with your GDPR rights, you have the right to lodge a complaint with a supervisory authority in the EU/EEA country where you reside, work, or where the alleged infringement occurred.
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
