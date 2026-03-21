import Header from "@/components/Header";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-1 text-[15px]">Is This OK? (ito)</p>
        <p className="text-muted-foreground mb-1 text-[15px]">Effective Date: March 21, 2026</p>
        <p className="text-muted-foreground mb-6 text-[15px]">
          Operated by Override Labs |{" "}
          <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
            overridelabspreventiontech@gmail.com
          </a>
        </p>

        <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <p>
            Is This OK? ("ito", "we", "us", or "our") is a free consent education tool operated by Override Labs, an Illinois nonprofit. This Privacy Policy explains what information we collect when you use isthisok.app, how we use it, and your rights regarding that information.
          </p>
          <p>
            By using ito, you agree to the practices described in this policy. If you do not agree, please do not use the app.
          </p>

          <section>
            <h2 className="text-lg font-medium mb-2">1. Who We Are</h2>
            <p>
              Override Labs is a nonprofit organization incorporated in Illinois. Our mission is harm prevention and consent education. ito is a tool designed to help users — including teenagers — reflect on consent and communication in relationships.
            </p>
            <p className="mt-2">
              Contact us at:{" "}
              <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
                overridelabspreventiontech@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">2. Age Requirements</h2>
            <p>
              ito is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you are under 13, please do not use this app.
            </p>
            <p className="mt-2">
              If we become aware that we have collected information from a child under 13, we will delete it promptly. If you believe a child under 13 has submitted information through ito, please contact us at{" "}
              <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
                overridelabspreventiontech@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">3. Information We Collect</h2>

            <h3 className="font-medium mt-4 mb-1">Scenario Submissions</h3>
            <p>
              When you use ito, you may type out a scenario or situation you are navigating. This text is submitted anonymously — we do not ask for your name, email, phone number, or any account information. It is stored in our secure database to help us understand how users engage with the tool and improve our responses, and reviewed by our team in aggregate to assess product quality and safety.
            </p>
            <p className="mt-2 font-medium">
              Important: Please do not include personally identifying information about yourself or others (such as full names, school names, or contact details) in your scenario text.
            </p>

            <h3 className="font-medium mt-4 mb-1">Analytics</h3>
            <p>
              We use Google Analytics in non-personalized mode to understand how people find and use ito. We collect general usage data such as page views, session duration, and general geographic region. We do not use Google Analytics to build individual user profiles or serve targeted advertising. Ad personalization features are disabled.
            </p>
            <p className="mt-2">
              You can opt out of Google Analytics at{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">
                tools.google.com/dlpage/gaoptout
              </a>.
            </p>

            <h3 className="font-medium mt-4 mb-1">Operational Data</h3>
            <p>
              When you submit a scenario, our systems generate an internal notification so our team is aware of new submissions. This notification contains the submission text and is used solely for product monitoring and safety review.
            </p>

            <h3 className="font-medium mt-4 mb-1">What We Do NOT Collect</h3>
            <p>
              We do not collect your name, email, contact information, device identifiers, advertising IDs, or any information that would allow us to contact you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">4. How We Use Your Information</h2>
            <p>
              We use your information to provide the ito tool and generate responses to your scenario, improve ito's responses and safety guardrails, understand how users engage with the product, and monitor for safety concerns. We do not use your information for marketing and we do not sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">5. How We Share Your Information</h2>
            <p>
              We share information only with service providers necessary to operate ito: Supabase (database), Vercel (hosting), and Google Analytics (usage analytics). We may also disclose information if required by law or to protect the safety of any person. We do not sell, rent, or share your data with advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">6. Data Retention</h2>
            <p>
              Submission text is retained as long as needed to operate and improve ito. If you would like your submission deleted, contact us at{" "}
              <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
                overridelabspreventiontech@gmail.com
              </a>{" "}
              with the approximate text of your submission so we can locate and remove it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">7. Cookies</h2>
            <p>
              ito does not use cookies for advertising or tracking. Google Analytics, used in non-personalized mode, may use cookies to distinguish between sessions. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">8. Security</h2>
            <p>
              We use secure database storage and encrypted connections (HTTPS). Because ito is designed for anonymous use, the best way to protect your privacy is to avoid including identifying information in your scenario text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">9. Your Rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, or delete data we hold. To make a request, contact us at{" "}
              <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
                overridelabspreventiontech@gmail.com
              </a>.
              {" "}California residents: we do not sell personal information and do not engage in cross-context behavioral advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">10. Third-Party Links</h2>
            <p>
              ito may contain links to external resources. We are not responsible for the privacy practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">11. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time and will update the effective date when we do. Continued use of ito after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">12. Contact Us</h2>
            <p>Override Labs</p>
            <p>
              <a href="mailto:overridelabspreventiontech@gmail.com" className="underline">
                overridelabspreventiontech@gmail.com
              </a>
            </p>
            <p>
              <a href="https://isthisok.app" className="underline">isthisok.app</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
