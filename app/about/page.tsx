import Image from 'next/image';
import { Card } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-8">Our Mission</h1>
          <p className="text-xl text-muted-foreground">
            SKAPL is a high-end energy consulting and project management firm specializing in the solar industry. 
            As we expand our horizons, we're bringing innovative solutions to complex energy challenges, 
            combining deep industry expertise with cutting-edge technology to drive sustainable transformation.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">Traditional Meets Modern</h3>
              <p className="text-muted-foreground">
                We bridge time-tested business principles with modern technological innovation, 
                creating solutions that honor experience while embracing the future.
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">East Meets West</h3>
              <p className="text-muted-foreground">
                Our approach combines Eastern wisdom and values with Western efficiency and innovation, 
                delivering comprehensive solutions that transcend cultural boundaries.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Leadership</h2>
          
          {/* Founder Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="https://media.licdn.com/dms/image/v2/C5603AQHLF8Zhf8p1Ng/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517438344207?e=1750291200&v=beta&t=sqAQVowoUwi0eUXsgeztDaic41cNg781z6VkXSgi-c8"
                alt = "Sanjib Kumar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">Sanjib Kumar</h3>
              <p className="text-xl text-muted-foreground mb-4">Founder & Managing Director</p>
              <p className="text-muted-foreground mb-6">
                A senior industry professional and the visionary behind both Swami Solar and SKAPL. 
                With over 30 years of experience, including his tenure as General Manager at Essar Steel India Ltd, 
                Sanjib has led large-scale industrial projects, greenfield implementations, and energy transformations.
              </p>
              <p className="text-muted-foreground">
                Under his guidance, Swami Solar grew into a trusted solar partner across Gujarat, serving residential, 
                commercial, and industrial sectors. As founder of SKAPL, Sanjib now brings this same spirit of excellence 
                into a broader horizon — offering clients renewable solutions, industrial consulting, and digital energy transformation.
              </p>
            </div>
          </div>

          {/* CTO Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative h-[400px] rounded-lg overflow-hidden md:order-2">
              <Image
                src="https://media.licdn.com/dms/image/v2/D4D03AQHz8-fBKSqI6A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1682571802609?e=1750291200&v=beta&t=nN9JohjehryJnS7I5jvuLnQhSepLhn0VSTb-EpWPFg0"
                alt="Vishrut Kumar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center md:order-1">
              <h3 className="text-2xl font-bold mb-2">Vishrut Kumar</h3>
              <p className="text-xl text-muted-foreground mb-4">Chief Technology Officer</p>
              <p className="text-muted-foreground mb-6">
                A dynamic young leader with a flair for AI, data analytics, and full-stack development. 
                Previously interned with VerSe Innovation (Dailyhunt) where he built internal analytics tools 
                and optimized model pipelines for AI performance.
              </p>
              <p className="text-muted-foreground">
                During his internship with Swami Solar, Vishrut redesigned the company's website, implemented 
                a smart cost calculator, and worked on internal process analysis. As CTO, he now drives smart 
                automation, system optimization, cloud architecture, and digital strategy, aligning SKAPL with 
                modern industrial demands.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}