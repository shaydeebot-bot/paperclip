export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: March 29, 2026
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            This privacy policy describes how the operator of this Paperclip instance
            ("we", "us", "our") collects, uses, and protects your personal information when you
            use this service. Paperclip is self-hosted software; the entity responsible for your
            data is the organization that deployed this instance, not Paperclip the software
            project.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions about this policy can be directed to:{" "}
            <span className="font-medium text-foreground">
              [PLACEHOLDER: operator contact email]
            </span>
          </p>
        </div>

        <Section title="1. What data we collect">
          <p>We collect the minimum data necessary to operate this service.</p>

          <SubSection title="Account information">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Name</strong> — your display name, provided at registration
              </li>
              <li>
                <strong>Email address</strong> — used to identify your account and, if
                enabled, to verify your identity
              </li>
              <li>
                <strong>Profile image</strong> — optional; only stored if you provide one
                via an OAuth provider
              </li>
            </ul>
          </SubSection>

          <SubSection title="Session data">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Session token</strong> — a secure, randomly generated token stored
                in a server-side session table; used to authenticate subsequent requests
              </li>
              <li>
                <strong>IP address</strong> — captured at session creation for security
                auditing
              </li>
              <li>
                <strong>User agent string</strong> — browser/client identifier, captured
                at session creation
              </li>
            </ul>
          </SubSection>

          <SubSection title="Work data you create">
            <ul className="list-disc pl-5 space-y-1">
              <li>Company and project names and descriptions you enter</li>
              <li>
                Issues, tasks, goals, and documents you create or are assigned to
              </li>
              <li>Comments and approval decisions</li>
              <li>Agent configurations and instructions you author</li>
              <li>
                Activity log entries — a record of actions taken within the platform (who
                created, updated, or deleted what, and when)
              </li>
            </ul>
          </SubSection>

          <SubSection title="LLM usage data">
            <p>
              When agents execute tasks using AI language models, we record cost and usage
              events including: the LLM provider, model name, input token count, output
              token count, and calculated cost estimate. This data is used to track spend
              against your configured budget limits and to display usage on the Costs page.
            </p>
            <p className="mt-2">
              <strong>Important:</strong> The content of prompts sent to LLMs and the model
              responses are not stored in this platform. Those requests flow directly between
              the execution adapter and the configured LLM provider. The LLM provider's own
              privacy policy governs that data.
            </p>
          </SubSection>

          <SubSection title="Stored secrets and credentials">
            <p>
              If you store API keys or other credentials in the platform's Secrets vault,
              those values are encrypted before storage. The encryption method depends on
              your instance's configuration (local encrypted storage, AWS Secrets Manager,
              GCP Secret Manager, or HashiCorp Vault). We do not have access to the
              plaintext values of secrets stored via external vault providers.
            </p>
          </SubSection>
        </Section>

        <Section title="2. What we do NOT collect">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              We do not use analytics cookies or third-party tracking scripts (no Google
              Analytics, Mixpanel, Segment, or similar)
            </li>
            <li>We do not sell or share your data with advertisers</li>
            <li>We do not build behavioral profiles or conduct cross-site tracking</li>
            <li>We do not collect payment card information directly</li>
          </ul>
        </Section>

        <Section title="3. Browser storage (localStorage)">
          <p>
            This application stores the following items in your browser's{" "}
            <code>localStorage</code>. These are functional preferences that remain on your
            device and are never transmitted to a server.
          </p>
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2 text-left font-medium">Key</th>
                  <th className="px-4 py-2 text-left font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <StorageRow
                  key_="paperclip.theme"
                  purpose="Remembers your light/dark theme preference"
                />
                <StorageRow
                  key_="paperclip:inbox:dismissed"
                  purpose="Tracks which inbox notifications you have dismissed"
                />
                <StorageRow
                  key_="paperclip:inbox:read-items"
                  purpose="Tracks which inbox notifications you have read"
                />
                <StorageRow
                  key_="paperclip:inbox:last-tab"
                  purpose="Remembers which inbox tab you last had open"
                />
                <StorageRow
                  key_="paperclip.projectOrder:{companyId}:{userId}"
                  purpose="Remembers the order you arranged projects in the sidebar"
                />
                <StorageRow
                  key_="paperclip.agentOrder:{companyId}:{userId}"
                  purpose="Remembers the order you arranged agents in the sidebar"
                />
                <StorageRow
                  key_="paperclip:recent-assignees"
                  purpose="Stores the last 10 agents you assigned work to, for quick access"
                />
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            No tracking cookies are set by this application. The session authentication
            cookie set by this service is an HTTP-only, server-side session token used
            solely to authenticate your requests.
          </p>
        </Section>

        <Section title="4. How we use your data">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>To operate the service</strong> — authenticating you, routing requests
              to the correct company workspace, and displaying your work data
            </li>
            <li>
              <strong>To enforce budget and access controls</strong> — tracking LLM token
              usage against configured monthly budgets per company
            </li>
            <li>
              <strong>For security and audit purposes</strong> — session metadata (IP,
              user agent) and activity log entries support incident investigation and access
              reviews
            </li>
            <li>
              <strong>To facilitate invitations and access management</strong> — invite
              tokens enable controlled access to company workspaces
            </li>
          </ul>
          <p className="mt-3 text-sm">
            The lawful basis for processing under GDPR is <strong>contract performance</strong>{" "}
            (operating the service you signed up for) and <strong>legitimate interests</strong>{" "}
            (security, fraud prevention, and budget management).
          </p>
        </Section>

        <Section title="5. Third-party services">
          <p>
            The operator of this instance may have configured the following third-party
            services. Their use of your data is governed by their own privacy policies.
          </p>
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2 text-left font-medium">Service</th>
                  <th className="px-4 py-2 text-left font-medium">Purpose</th>
                  <th className="px-4 py-2 text-left font-medium">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2 font-medium">LLM providers (Anthropic, OpenAI, Google Gemini, others)</td>
                  <td className="px-4 py-2 text-muted-foreground">Executing AI agent tasks. Prompts and responses are sent to and processed by the configured provider.</td>
                  <td className="px-4 py-2 text-muted-foreground">When configured by the operator or user</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">AWS S3 (or compatible)</td>
                  <td className="px-4 py-2 text-muted-foreground">Storing file attachments and workspace artifacts</td>
                  <td className="px-4 py-2 text-muted-foreground">If S3 storage provider is configured</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">AWS Secrets Manager / GCP Secret Manager / HashiCorp Vault</td>
                  <td className="px-4 py-2 text-muted-foreground">Storing encrypted secrets (API keys, credentials)</td>
                  <td className="px-4 py-2 text-muted-foreground">If an external secrets provider is configured</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain your personal data for as long as your account is active or as needed
            to provide the service. Session tokens expire automatically per the session
            configuration; expired sessions are removed from the database.
          </p>
          <p className="mt-2">
            Activity log entries, cost events, and work data are retained indefinitely
            unless the instance operator configures a data retention or archival policy, or
            you request deletion.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Depending on your location, you may have the following rights regarding your
            personal data:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Access</strong> — request a copy of the personal data we hold about you
            </li>
            <li>
              <strong>Correction</strong> — request correction of inaccurate data
            </li>
            <li>
              <strong>Erasure</strong> — request deletion of your personal data ("right to
              be forgotten"), subject to legitimate retention obligations
            </li>
            <li>
              <strong>Portability</strong> — request your data in a machine-readable format
            </li>
            <li>
              <strong>Restriction</strong> — request that we restrict processing of your
              data while a dispute is resolved
            </li>
            <li>
              <strong>Objection</strong> — object to processing based on legitimate
              interests
            </li>
          </ul>
          <p className="mt-3 text-sm">
            To exercise any of these rights, contact the instance operator at{" "}
            <span className="font-medium text-foreground">
              [PLACEHOLDER: operator contact email]
            </span>
            . Under GDPR, we will respond within 30 days. Under CCPA/CPRA, we will
            acknowledge within 10 business days and respond within 45 calendar days.
          </p>
          <p className="mt-2 text-sm">
            If you are in the EU/EEA and believe your rights have not been respected, you
            have the right to lodge a complaint with your local supervisory authority.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We implement the following technical and organizational security measures:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>Session tokens are stored as HTTP-only cookies and hashed in the database</li>
            <li>Secrets stored in the local vault are encrypted at rest</li>
            <li>Agent API keys are stored using secure token hashing</li>
            <li>Input to web endpoints is validated with schema enforcement (Zod)</li>
            <li>
              HTML output is sanitized (DOMPurify) to prevent cross-site scripting
            </li>
          </ul>
          <p className="mt-3 text-sm">
            No method of transmission or storage is 100% secure. If you discover a
            security vulnerability, please report it to{" "}
            <span className="font-medium text-foreground">
              [PLACEHOLDER: operator security contact]
            </span>
            .
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this privacy policy from time to time. The "Last updated" date
            at the top of this page will reflect the most recent revision. Continued use of
            the service after a policy change constitutes acceptance of the updated terms.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For any questions, data subject requests, or concerns about this privacy policy,
            please contact the operator of this Paperclip instance:
          </p>
          <p className="mt-2 font-medium text-foreground">
            [PLACEHOLDER: operator name]
            <br />
            [PLACEHOLDER: operator address]
            <br />
            [PLACEHOLDER: operator contact email]
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 space-y-1.5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function StorageRow({ key_, purpose }: { key_: string; purpose: string }) {
  return (
    <tr>
      <td className="px-4 py-2 font-mono text-xs">{key_}</td>
      <td className="px-4 py-2 text-muted-foreground">{purpose}</td>
    </tr>
  );
}
