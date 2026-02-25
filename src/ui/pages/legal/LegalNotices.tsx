import { Container, Header, Sidebar } from '../../components'

export function LegalNotices() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <Container className="flex-1">
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-bold text-foreground mb-8">Legal Notices</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Company Information</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Company Name:</strong> Kair0s Technologies Ltd.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Registration Number:</strong> 12345678
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Registered Office:</strong> 123 Innovation Drive, Tech City, TC 12345
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Business Address:</strong> 456 Gateway Boulevard, Silicon Valley, CA 94025
                  </p>
                  <p className="text-muted-foreground">
                    <strong>VAT Number:</strong> EU123456789
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Contact Information</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>General Inquiries:</strong> info@kair0s.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Legal Department:</strong> legal@kair0s.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Data Protection:</strong> privacy@kair0s.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Support:</strong> support@kair0s.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Phone:</strong> +1-555-KAIROS-1
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Intellectual Property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Trademarks</h3>
                    <p className="text-muted-foreground">
                      Kair0s® is a registered trademark of Kair0s Technologies Ltd. All other trademarks, service marks, and trade names used in this service are the property of their respective owners.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Copyright</h3>
                    <p className="text-muted-foreground">
                      © 2024 Kair0s Technologies Ltd. All rights reserved. The content, design, and functionality of this service are protected by copyright and other intellectual property laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Patents</h3>
                    <p className="text-muted-foreground">
                      Certain technologies and methodologies used in our AI Gateway service are protected by pending and granted patents. Unauthorized use of these technologies is strictly prohibited.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Regulatory Compliance</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Data Protection</h3>
                    <p className="text-muted-foreground">
                      We are registered with the relevant data protection authorities and comply with GDPR, CCPA, and other applicable data protection regulations.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Financial Regulations</h3>
                    <p className="text-muted-foreground">
                      Our payment processing and financial services comply with PCI DSS, PSD2, and other relevant financial regulations.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">AI Ethics</h3>
                    <p className="text-muted-foreground">
                      We adhere to ethical AI guidelines and principles, including transparency, fairness, and accountability in AI systems.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Jurisdiction and Governing Law</h2>
                <p className="text-muted-foreground">
                  These legal notices and our terms of service are governed by and construed in accordance with the laws of the jurisdiction where our company is registered, without regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Third-Party Services</h2>
                <p className="text-muted-foreground mb-4">
                  Our service integrates with various third-party AI model providers and services. These include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>OpenAI (GPT models)</li>
                  <li>Anthropic (Claude models)</li>
                  <li>Google (Gemini models)</li>
                  <li>Meta (Llama models)</li>
                  <li>Various open-source model providers</li>
                </ul>
                <p className="text-muted-foreground">
                  Each third-party service is subject to its own terms of service and privacy policies, which we recommend you review.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Service Level Agreements</h2>
                <p className="text-muted-foreground mb-4">
                  Our service level commitments include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>99.9% uptime for core API services</li>
                  <li>Response time under 500ms for standard queries</li>
                  <li>24/7 technical support for enterprise customers</li>
                  <li>Regular security updates and maintenance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Liability and Insurance</h2>
                <p className="text-muted-foreground">
                  Kair0s Technologies Ltd. maintains comprehensive professional liability and cyber insurance coverage. Our liability is limited as specified in our Terms of Service, and we recommend that enterprise customers obtain appropriate insurance coverage for their use of AI services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Accessibility</h2>
                <p className="text-muted-foreground">
                  We are committed to making our service accessible to people with disabilities. Our service complies with WCAG 2.1 Level AA standards and relevant accessibility regulations. If you encounter accessibility issues, please contact our accessibility team at accessibility@kair0s.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Export Controls</h2>
                <p className="text-muted-foreground">
                  Our service and technology may be subject to export control laws and regulations. Users are responsible for complying with all applicable export control laws when using our service, including restrictions on use in certain countries or by certain persons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Updates and Modifications</h2>
                <p className="text-muted-foreground">
                  We may update these legal notices from time to time to reflect changes in our business, legal requirements, or other factors. Changes will be effective immediately upon posting to this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Additional Information</h2>
                <p className="text-muted-foreground mb-4">
                  For additional legal information or specific inquiries, please contact:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Legal Department:</strong> legal@kair0s.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Registered Agent:</strong> Kair0s Legal Services, 123 Innovation Drive, Tech City, TC 12345
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Business Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM UTC
                  </p>
                </div>
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
