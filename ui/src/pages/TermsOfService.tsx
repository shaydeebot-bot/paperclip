export function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: March 29, 2026
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            These Terms of Service ("Terms") govern your access to and use of this
            Paperclip instance ("Service") operated by{" "}
            <span className="font-medium text-foreground">
              [PLACEHOLDER: operator name]
            </span>{" "}
            ("Operator", "we", "us"). By creating an account or using the Service, you agree
            to these Terms. If you do not agree, do not use the Service.
          </p>
        </div>

        <Section title="1. What Paperclip is">
          <p>
            Paperclip is an AI agent management platform that allows teams to create,
            configure, and run AI agents that execute software development and automation
            tasks. Agents connect to third-party AI language model (LLM) providers
            configured by the Operator or by you. The Operator is responsible for the
            deployment, configuration, and data handling of this instance.
          </p>
        </Section>

        <Section title="2. Eligibility and account registration">
          <p>
            You may use the Service only if you have received an invitation from the
            Operator or have been granted access by an existing member of your organization.
            You must:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate registration information (name and email address)</li>
            <li>Keep your credentials confidential and not share your account</li>
            <li>
              Promptly notify the Operator if you suspect unauthorized access to your
              account
            </li>
            <li>
              Be at least 18 years old, or have the legal capacity to enter contracts in
              your jurisdiction
            </li>
          </ul>
          <p>
            You are responsible for all activity that occurs under your account.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Violate any applicable law, regulation, or third-party right (including
              intellectual property rights, privacy rights, and export control laws)
            </li>
            <li>
              Direct AI agents to generate, transmit, or store content that is illegal,
              harmful, fraudulent, defamatory, or that violates the terms of any LLM
              provider you have configured
            </li>
            <li>
              Attempt to gain unauthorized access to systems, networks, or data —
              including systems connected to or controlled by agents running on this
              platform
            </li>
            <li>
              Use the platform to develop or deploy malware, ransomware, spyware, or
              other malicious tools
            </li>
            <li>
              Interfere with or disrupt the integrity, performance, or security of the
              Service or any connected infrastructure
            </li>
            <li>
              Circumvent, disable, or interfere with security features, access controls,
              rate limits, or budget enforcement mechanisms
            </li>
            <li>
              Use the Service in a way that exceeds your authorized scope of access as
              defined by the Operator
            </li>
          </ul>
        </Section>

        <Section title="4. AI agents and LLM providers">
          <p>
            This platform enables agents to communicate with AI language model providers
            (such as Anthropic, OpenAI, Google, Cursor, and others) that you or the
            Operator configure. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>LLM provider terms apply.</strong> Your use of any LLM adapter is
              subject to that provider's terms of service and usage policies. Ensure that
              agent tasks comply with the applicable provider's acceptable use policy.
            </li>
            <li>
              <strong>AI outputs are not guaranteed.</strong> AI-generated content may be
              incomplete, inaccurate, or inappropriate. You are responsible for reviewing
              agent outputs before acting on them, especially in production environments.
            </li>
            <li>
              <strong>You are responsible for agent instructions.</strong> The content of
              system prompts, task descriptions, and input context you provide to agents
              is your responsibility. Do not include personally identifiable information,
              regulated data, or trade secrets in agent inputs unless you have assessed
              the implications under your applicable data protection obligations.
            </li>
            <li>
              <strong>Cost accountability.</strong> LLM API calls incur costs charged by
              the provider. Budget limits configured in this platform are best-effort
              controls, not guaranteed hard caps. You are responsible for monitoring and
              managing your LLM provider spending.
            </li>
          </ul>
        </Section>

        <Section title="5. Secrets and credentials">
          <p>
            You may store API keys and other credentials in the platform's encrypted
            Secrets vault. By doing so, you:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Authorize agents you have assigned to access those secrets as needed to
              complete assigned tasks
            </li>
            <li>
              Acknowledge that secrets are stored encrypted, but that encryption does not
              eliminate all risk; do not store credentials that grant access to critical or
              irreplaceable systems without independent access controls in place
            </li>
            <li>
              Accept sole responsibility for the scope and impact of any credential you
              store and authorize an agent to use
            </li>
          </ul>
          <p>
            Do not store passwords to personal accounts, banking credentials, or any
            credential whose misuse would cause you personal or financial harm beyond the
            scope of this platform.
          </p>
        </Section>

        <Section title="6. Your content and data">
          <p>
            You retain ownership of all content you create within the Service (issues,
            documents, agent configurations, etc.). By using the Service, you grant the
            Operator a limited license to process, store, and display your content solely
            as necessary to operate the Service.
          </p>
          <p>
            You are responsible for ensuring that any data you input to the Service — or
            that agents process on your behalf — complies with applicable laws, including
            data protection regulations. Do not input personal data of third parties unless
            you have a lawful basis to do so.
          </p>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            Paperclip is open-source software. The source code is licensed under its
            applicable open-source license. These Terms do not restrict your rights under
            that license.
          </p>
          <p>
            All trademarks, service marks, and logos associated with Paperclip and the
            Operator remain the property of their respective owners. Nothing in these Terms
            grants you a license to use them without prior written permission.
          </p>
        </Section>

        <Section title="8. Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference.
          </p>
        </Section>

        <Section title="9. Disclaimers">
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
          </p>
          <p>
            The Operator does not warrant that the Service will be error-free, that defects
            will be corrected, or that the Service is free from viruses or other harmful
            components. AI agent outputs are not warranted to be accurate, complete, or
            suitable for any particular purpose.
          </p>
        </Section>

        <Section title="10. Limitation of liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE OPERATOR SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING LOSS OF PROFITS, DATA, BUSINESS, OR GOODWILL, ARISING OUT
            OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            THE OPERATOR'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING UNDER
            THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT PAID BY YOU TO THE
            OPERATOR IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS
            (USD $100).
          </p>
          <p>
            Some jurisdictions do not allow exclusion of certain warranties or limitation of
            liability, so some of the above may not apply to you.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless the Operator and its
            personnel from any claims, liabilities, damages, and expenses (including
            reasonable attorneys' fees) arising out of or related to: (a) your use of the
            Service; (b) your violation of these Terms; (c) content you submit or actions
            taken by agents you configure; or (d) your violation of any third-party rights
            or applicable law.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            The Operator may suspend or terminate your access to the Service at any time,
            with or without cause, with or without notice. You may stop using the Service
            at any time. Upon termination:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your right to access the Service ceases immediately</li>
            <li>
              The Operator may delete your account data, subject to any legal retention
              obligations
            </li>
            <li>
              Sections 7 (Intellectual property), 9 (Disclaimers), 10 (Limitation of
              liability), 11 (Indemnification), and 14 (Governing law) survive termination
            </li>
          </ul>
        </Section>

        <Section title="13. Changes to these Terms">
          <p>
            The Operator may update these Terms at any time. The "Last updated" date at the
            top of this page reflects the most recent revision. Your continued use of the
            Service after a change constitutes your acceptance of the revised Terms.
            Material changes will be communicated via in-app notice where practicable.
          </p>
        </Section>

        <Section title="14. Governing law">
          <p>
            These Terms are governed by the laws of{" "}
            <span className="font-medium text-foreground">
              [PLACEHOLDER: jurisdiction, e.g., "the State of Delaware, USA"]
            </span>
            , without regard to its conflict-of-law provisions. Any disputes arising under
            these Terms shall be resolved in the courts of that jurisdiction, and you
            consent to personal jurisdiction therein.
          </p>
        </Section>

        <Section title="15. Contact">
          <p>
            For questions about these Terms, contact the Operator:
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
