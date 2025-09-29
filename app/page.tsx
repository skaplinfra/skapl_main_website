'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Leaf, Lightbulb, HardHat, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import content from '@/CONTENT.json';

// Helper function to dynamically import icons
const iconComponents = {
  Leaf,
  Lightbulb,
  HardHat,
  Users
};

export default function Home() {
  const [isStatic, setIsStatic] = useState<string | undefined>(undefined);
  const homeContent = content.home;
  
  useEffect(() => {
    setIsStatic(process.env.NEXT_PUBLIC_STATIC_EXPORT);
    console.log('Static Export:', process.env.NEXT_PUBLIC_STATIC_EXPORT);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center">
        <Image
          src={homeContent.hero.backgroundImage}
          alt="Modern Architecture"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {homeContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            {homeContent.hero.subtitle}
          </p>
          {isStatic !== undefined && (
            <p className="text-sm text-white/70 mt-4">
              Build mode: {isStatic === 'true' ? 'Static Export' : 'Server-side Rendering'}
            </p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">
            {homeContent.features.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {homeContent.features.cards.map((feature, index) => {
              const IconComponent = iconComponents[feature.icon as keyof typeof iconComponents];
              return (
                <Card key={index} className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="text-sm space-y-2 text-left">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx}>✓ {benefit}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}