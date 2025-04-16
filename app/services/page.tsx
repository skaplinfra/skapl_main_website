import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ArrowRight, Zap, Shield, BarChart, Users } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Modern Infrastructure"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Engineering Possibilities.<br />Delivering Impact.
          </h1>
          <p className="text-xl text-white/90">
            Strategic partners in your journey towards building resilient infrastructure,
            accelerating clean energy adoption, and managing complex projects with confidence.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Renewable Energy Section */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <Zap className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Renewable Energy & Sustainability Advisory</h2>
            </div>
            <p className="text-xl text-muted-foreground mb-12">
              Driving transitions that matter through comprehensive energy solutions and strategic planning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Strategic Energy Planning</h3>
                <p className="text-muted-foreground">
                  Tailored roadmaps for integrating clean energy — including solar, wind, hybrid systems, 
                  and energy storage — into your operations.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Policy & Regulatory Guidance</h3>
                <p className="text-muted-foreground">
                  Expert navigation of national and global energy regulations to unlock project potential.
                </p>
              </Card>
            </div>
          </div>

          {/* Project Management Section */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <BarChart className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Project Management & Execution Support</h2>
            </div>
            <p className="text-xl text-muted-foreground mb-12">
              From concept to commissioning — we lead with precision.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">End-to-End Project Planning</h3>
                <p className="text-muted-foreground">
                  Structuring timelines, deliverables, and resource flows to meet your goals efficiently.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Risk & Quality Management</h3>
                <p className="text-muted-foreground">
                  Proven systems to manage uncertainty, control budgets, and uphold quality benchmarks.
                </p>
              </Card>
            </div>
          </div>

          {/* Infrastructure Section */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Infrastructure & Asset Development</h2>
            </div>
            <p className="text-xl text-muted-foreground mb-12">
              Powering infrastructure that shapes the future.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Development Strategy</h3>
                <p className="text-muted-foreground">
                  Market intelligence, regulatory reviews, and financial modeling to de-risk your decisions.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Operations Optimization</h3>
                <p className="text-muted-foreground">
                  Performance diagnostics and process enhancements to extend asset life and improve ROI.
                </p>
              </Card>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Why Choose SKAPL?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Multidisciplinary Expertise</h3>
                <p className="text-muted-foreground">
                  Bridging engineering, strategy, and policy across energy and infrastructure domains.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Client-First Approach</h3>
                <p className="text-muted-foreground">
                  Every engagement is tailored, transparent, and driven by your goals.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Innovation-Driven</h3>
                <p className="text-muted-foreground">
                  We apply the latest tools, trends, and insights to deliver future-ready solutions.
                </p>
              </Card>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Global Perspective</h3>
                <p className="text-muted-foreground">
                  Combining international experience with region-specific knowledge for impactful delivery.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Let's Build What's Next — Together</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you're a developer, investor, government body, or enterprise ready to transition,
            SKAPL is here to guide your most critical projects from ambition to achievement.
          </p>
          <div className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <span className="text-lg font-semibold">Reach out to start a conversation</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </section>
    </div>
  );
}