import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { SUPPORT_EMAIL, breadcrumbLd } from "@/lib/site";

const title = "Privacy Policy | Qureshi Jewelers";
const description =
  "How Qureshi Jewelers collects, uses, stores and protects your personal information when you shop, create an account or join the Qureshi Circle rewards program.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const sections: Array<{ heading: string; body: string[] }> = [
  {
    heading: "1. Who we are",
    body: [
      "Qureshi Jewelers (\u201cwe\u201d, \u201cus\u201d) operates this online store and is responsible for the personal information described in this policy. Our online store is powered by Shopify, which processes orders, payments and customer accounts on our behalf.",
      `Questions about this policy or your data can be sent to ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    heading: "2. Information we collect",
    body: [
      "Information you give us: name, email address, phone number, shipping and billing address, order contents, account credentials, rewards activity and any message you send to client care.",
      "Information collected automatically: device and browser type, pages viewed, referring site, approximate location derived from IP address, and cookie identifiers used to keep your bag and session working.",
      "Payment information: card details are entered directly into Shopify\u2019s PCI-DSS compliant checkout and its payment processors. We never see or store your full card number.",
    ],
  },
  {
    heading: "3. How we use your information",
    body: [
      "To process, fulfil, ship and, where necessary, refund your orders; to authenticate your account; to calculate Qureshi Circle points and tiers; to provide client care; to detect and prevent fraud; to comply with tax and legal obligations; and, where you have opted in, to send marketing email about new pieces and offers.",
      "We do not sell your personal information, and we do not share it with third parties for their own independent marketing.",
    ],
  },
  {
    heading: "4. Service providers",
    body: [
      "We share only the data necessary with providers that operate the store on our behalf: Shopify (storefront, checkout, customer accounts, order records), payment processors, shipping carriers and address validation, and email delivery providers. Each is bound by contract to use the data only to provide their service.",
    ],
  },
  {
    heading: "5. Cookies and tracking",
    body: [
      "Essential cookies keep your shopping bag, session and security protections working and cannot be switched off. Analytics and advertising cookies, where used, help us understand which pages lead to purchases. You can clear or block cookies in your browser, though essential cookies are required for checkout to function.",
      "We honour Global Privacy Control and Do Not Track signals where your browser sends them.",
    ],
  },
  {
    heading: "6. Your rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, delete or receive a portable copy of your personal information, to withdraw consent to marketing at any time, and to opt out of the sale or sharing of personal information (we do not sell it). California residents have these rights under the CCPA/CPRA; residents of the EEA and UK have equivalent rights under the GDPR.",
      `To exercise any right, email ${SUPPORT_EMAIL} from the address on your account. We respond within 30 days and will never discriminate against you for making a request.`,
    ],
  },
  {
    heading: "7. Data retention",
    body: [
      "Order and transaction records are retained for as long as required by tax and accounting law (typically seven years). Account and rewards data is retained while your account is open and for a short period afterwards. Marketing contact data is deleted promptly on unsubscribe request.",
    ],
  },
  {
    heading: "8. Security",
    body: [
      "The store is served over TLS, checkout and payment handling is PCI-DSS compliant through Shopify, and access to customer records is limited to staff who need it. No online system is perfectly secure, so please use a unique password for your account.",
    ],
  },
  {
    heading: "9. Children",
    body: [
      "This store is not directed to children under 16, and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will delete it.",
    ],
  },
  {
    heading: "10. Changes to this policy",
    body: [
      "We may update this policy as our practices or the law change. The effective date below always reflects the current version, and material changes will be highlighted on this page.",
    ],
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[900px] px-6 py-14 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">Legal</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Effective 1 January 2026
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-[900px] px-6 py-14 sm:px-10">
          {sections.map((s) => (
            <section key={s.heading} className="mb-10 border-t border-border pt-7 first:border-0 first:pt-0">
              <h2 className="font-display text-2xl">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p.slice(0, 30)} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <SiteFooter />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ])}
      />
    </div>
  );
}
