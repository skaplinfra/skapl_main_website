import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Leaf, Lightbulb, HardHat, Users } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
          alt="Modern Architecture"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Vision is the art of seeing what is invisible to others
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            At SKAPL, we don't just build systems — we build sustainable futures.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose SKAPL?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sustainable Solutions */}
            <Card className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Sustainable Solutions</h3>
              <p className="text-muted-foreground mb-6">
                We are driven by a passion for sustainability. Our solar installations help reduce energy costs and contribute to a greener planet.
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li>✓ Lower electricity bills</li>
                <li>✓ Reduce carbon footprint</li>
                <li>✓ Long-term sustainable investment</li>
              </ul>
            </Card>

            {/* Innovative Technology */}
            <Card className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovative Technology</h3>
              <p className="text-muted-foreground mb-6">
                We bring cutting-edge AI-driven tools and smart energy management systems to ensure the highest performance.
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li>✓ AI-driven energy optimization</li>
                <li>✓ Real-time monitoring and analytics</li>
                <li>✓ Future-ready infrastructure</li>
              </ul>
            </Card>

            {/* Expert Project Management */}
            <Card className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <HardHat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Project Management</h3>
              <p className="text-muted-foreground mb-6">
                With over 30 years of combined experience, our team ensures precision and efficiency in every project.
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li>✓ Over 30 years of industry experience</li>
                <li>✓ Streamlined project execution</li>
                <li>✓ End-to-end support</li>
              </ul>
            </Card>

            {/* Trusted by Thousands */}
            <Card className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Trusted by Thousands</h3>
              <p className="text-muted-foreground mb-6">
                With over 3,200 satisfied customers, we have earned a reputation for delivering reliable energy solutions.
              </p>
              <ul className="text-sm space-y-2 text-left">
                <li>✓ 3,200+ satisfied customers</li>
                <li>✓ Proven track record of success</li>
                <li>✓ Strong after-sales support</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}