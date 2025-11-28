import Link from "next/link"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Cookie Policy - ChainMart",
  description: "Read ChainMart cookie policy and cookie preferences.",
}

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground">
            ChainMart
          </Link>
          <div className="space-x-4">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 container py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small files that are stored on your device (computer, tablet, or mobile phone) when you
                visit our website. They allow us to remember information about your visit, including your preferences
                and login information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Essential Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable you to navigate the
                    site and use its features, such as maintaining your login session.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Performance Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies collect information about how you use our website, such as which pages you visit most
                    often and whether you receive error messages. This information is aggregated and used to improve
                    website performance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Functional Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies remember your preferences and choices to provide a more personalized experience, such
                    as remembering your language preference or shopping cart contents.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Marketing Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are used to track your activity across websites and build a profile of your interests.
                    This allows us and our partners to display targeted ads.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Managing Your Cookie Preferences</h2>
              <p className="text-muted-foreground mb-4">
                Most web browsers allow you to control cookies through their settings. You can typically find these
                settings in the Options or Preferences menu of your browser. Here&apos;s how to manage cookies in
                popular browsers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Chrome: Settings &gt; Privacy and security &gt; Cookies and other site data</li>
                <li>Firefox: Preferences &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                <li>Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
                <li>Edge: Settings &gt; Privacy, search, and services &gt; Cookies and other site permissions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Cookies</h2>
              <p className="text-muted-foreground">
                We may also allow third-party service providers to place cookies on your device for analytics,
                advertising, and other purposes. These third parties have their own cookie policies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Impact of Disabling Cookies</h2>
              <p className="text-muted-foreground">
                If you choose to disable cookies, some features of our website may not function properly. For example,
                you may not be able to stay logged in or maintain your shopping cart.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our cookie policy, please contact us at privacy@chainmart.io
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
