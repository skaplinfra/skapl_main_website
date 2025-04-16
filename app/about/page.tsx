import Image from 'next/image';
import { Card } from '@/components/ui/card';

type LeadershipMember = {
  name: string;
  role: string;
  image: string;
  description: string;
  impact: string;
};

type TeamMember = {
  name: string;
  role: string;
  image: string;
  quote?: string;
};

const leadership: LeadershipMember[] = [
  {
    name: "Sanjib Kumar",
    role: "Founder & Managing Director",
    image: "https://media.licdn.com/dms/image/v2/C5603AQHLF8Zhf8p1Ng/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517438344207?e=1750291200&v=beta&t=sqAQVowoUwi0eUXsgeztDaic41cNg781z6VkXSgi-c8",
    description: `A senior industry professional and the visionary behind both Swami Solar and SKAPL. 
      With over 30 years of experience, including his tenure as General Manager at Essar Steel India Ltd, 
      Sanjib has led large-scale industrial projects, greenfield implementations, and energy transformations.`,
    impact: `Under his guidance, Swami Solar grew into a trusted solar partner across Gujarat, serving residential, 
      commercial, and industrial sectors. As founder of SKAPL, Sanjib now brings this same spirit of excellence 
      into a broader horizon — offering clients renewable solutions, industrial consulting, and digital energy transformation.`
  },
  {
    name: "Vishrut Kumar",
    role: "Chief Technology Officer",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHz8-fBKSqI6A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1682571802609?e=1750291200&v=beta&t=nN9JohjehryJnS7I5jvuLnQhSepLhn0VSTb-EpWPFg0",
    description: `A dynamic young leader with a flair for AI, data analytics, and full-stack development. 
      Previously interned with VerSe Innovation (Dailyhunt) where he built internal analytics tools 
      and optimized model pipelines for AI performance.`,
    impact: `During his internship with Swami Solar, Vishrut redesigned the company's website, implemented 
      a smart cost calculator, and worked on internal process analysis. As CTO, he now drives smart 
      automation, system optimization, cloud architecture, and digital strategy, aligning SKAPL with 
      modern industrial demands.`
  }
];

const teamMembers: TeamMember[] = [
  {
    name: leadership[0].name,
    role: leadership[0].role,
    image: leadership[0].image,
    quote: "Vision without execution is just hallucination. We turn sustainable dreams into reality."
  },
  {
    name: leadership[1].name,
    role: leadership[1].role,
    image: leadership[1].image,
    quote: "Technology is not just about innovation; it's about creating meaningful impact."
  },
  {
    name: "Tom",
    role: "Chief Happiness Officer",
    quote: "Just be happy",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
  },
  {
    name: "Sarah",
    role: "Business Development executive",
    quote: "My job is to make people happy :)",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80"
  },
  {
    name: "Clint",
    role: "Intern",
    quote: "I push horrible code on github and make it look like a masterpiece",
    image: "https://images.unsplash.com/photo-1610088441520-4352457e7095?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

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
          
          {leadership.map((leader, index) => (
            <div 
              key={leader.name}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 ${
                index !== leadership.length - 1 ? 'mb-24' : ''
              }`}
            >
              <div className={`relative h-[400px] rounded-lg overflow-hidden ${
                index % 2 === 1 ? 'md:order-2' : ''
              }`}>
                <Image
                  src={leader.image}
                  alt={leader.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className={`flex flex-col justify-center ${
                index % 2 === 1 ? 'md:order-1' : ''
              }`}>
                <h3 className="text-2xl font-bold mb-2">{leader.name}</h3>
                <p className="text-xl text-muted-foreground mb-4">{leader.role}</p>
                <p className="text-muted-foreground mb-6">{leader.description}</p>
                <p className="text-muted-foreground">{leader.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary mb-4">{member.role}</p>
                  <div className="relative">
                    <span className="absolute top-0 left-0 text-4xl text-primary opacity-20">"</span>
                    <p className="text-muted-foreground italic pl-6 pr-4">
                      {member.quote}
                    </p>
                    <span className="absolute bottom-0 right-0 text-4xl text-primary opacity-20">"</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}