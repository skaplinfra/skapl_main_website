import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ArrowRight, Zap, Shield, BarChart, Users } from 'lucide-react';
import content from '@/CONTENT.json';

// Helper function to dynamically import icons
const iconComponents = {
  Zap,
  Shield,
  BarChart,
  Users,
  ArrowRight
};

export default function ServicesPage() {
  const servicesContent = content.services;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center">
        <Image
          src={servicesContent.hero.backgroundImage}
          alt="Modern Infrastructure"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {servicesContent.hero.title}
          </h1>
          <p className="text-xl text-white/90">
            {servicesContent.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Service Sections */}
          {servicesContent.sections.map((section, sectionIndex) => {
            const IconComponent = iconComponents[section.icon as keyof typeof iconComponents];
            return (
              <div key={sectionIndex} className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                  {IconComponent && <IconComponent className="h-8 w-8 text-primary" />}
                  <h2 className="text-3xl font-bold">{section.title}</h2>
                </div>
                <p className="text-xl text-muted-foreground mb-12">
                  {section.subtitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {section.services.map((service, serviceIndex) => (
                    <Card key={serviceIndex} className="p-8">
                      <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Why Choose Us Section */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              {iconComponents[servicesContent.whyChooseUs.icon as keyof typeof iconComponents] && (
                <Users className="h-8 w-8 text-primary" />
              )}
              <h2 className="text-3xl font-bold">{servicesContent.whyChooseUs.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesContent.whyChooseUs.reasons.map((reason, index) => (
                <Card key={index} className="p-8">
                  <h3 className="text-xl font-semibold mb-4">{reason.title}</h3>
                  <p className="text-muted-foreground">
                    {reason.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{servicesContent.cta.title}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {servicesContent.cta.description}
          </p>
          <div className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <span className="text-lg font-semibold">{servicesContent.cta.buttonText}</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </section>
    </div>
  );
}