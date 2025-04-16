export default function PrivacyPage() {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-4">
              At SKAPL, we take your privacy seriously. This privacy policy describes how we collect, use, and protect your personal information.
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
              <li>Name and contact information</li>
              <li>Company details</li>
              <li>Project requirements</li>
              <li>Communication preferences</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
              <li>Provide and improve our services</li>
              <li>Communicate with you about our services</li>
              <li>Send you important updates and notifications</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Talent Acquisition</h2>
            <p className="text-muted-foreground mb-4">
              As part of our growth, SKAPL may collect personal and professional information from individuals applying for job opportunities. This information may include resumes, portfolios, work history, and contact details.
            </p>
            <p className="text-muted-foreground mb-4">
              We use this data solely for recruitment purposes, and it is handled with strict confidentiality. Only authorized HR personnel have access to applicant information, and it is not shared with third parties without consent.
            </p>
            <p className="text-muted-foreground">
              If you'd like us to delete your submitted application or data, please contact us at <a className="underline" href="mailto:careers@skapl.com">careers@skapl.com</a>.
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our privacy policy, please contact us at <a className="underline" href="mailto:contact@skapl.com">contact@skapl.com</a>.
            </p>
          </section>
        </div>
      </div>
    );
  }
  