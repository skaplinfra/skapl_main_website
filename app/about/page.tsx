import Image from 'next/image';
import { Card } from '@/components/ui/card';
import content from '@/CONTENT.json';

export default function AboutPage() {
  const aboutContent = content.about;
  const leadershipMembers = aboutContent.leadership.members;
  const teamMembers = [...leadershipMembers, ...aboutContent.team.members.filter(
    member => !leadershipMembers.some(lmember => lmember.name === member.name)
  )];

  return (
    <div className="min-h-screen bg-background">
      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-8">{aboutContent.mission.title}</h1>
          <p className="text-xl text-muted-foreground">
            {aboutContent.mission.description}
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">{aboutContent.values.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aboutContent.values.cards.map((value, index) => (
              <Card key={index} className="p-8">
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">{aboutContent.leadership.title}</h2>
          
          {leadershipMembers.map((leader, index) => (
            <div 
              key={leader.name}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 ${
                index !== leadershipMembers.length - 1 ? 'mb-24' : ''
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
          <h2 className="text-3xl font-bold text-center mb-16">{aboutContent.team.title}</h2>
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
                  {member.quote && (
                    <div className="relative">
                      <span className="absolute top-0 left-0 text-4xl text-primary opacity-20">"</span>
                      <p className="text-muted-foreground italic pl-6 pr-4">
                        {member.quote}
                      </p>
                      <span className="absolute bottom-0 right-0 text-4xl text-primary opacity-20">"</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}