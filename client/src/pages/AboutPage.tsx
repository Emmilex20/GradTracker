import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const teamMembers = [
  {
    name: 'Jane Doe',
    title: 'Co-Founder & CEO',
    bio: 'Jane is an expert in student success platforms with a background in education technology and a Master\'s degree from Stanford University. She built the first version of Grad Tracker on her kitchen table, driven by a passion for helping students achieve their academic goals without the stress she experienced. She leads our vision, ensuring every feature is truly student-first.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'John Smith',
    title: 'Co-Founder & CTO',
    bio: 'A brilliant software engineer and problem-solver, John holds a Computer Science degree from the Massachusetts Institute of Technology. He specializes in building scalable and intuitive web applications. John is the technical backbone of Grad Tracker, responsible for the robust data pipeline and seamless user experience that makes the platform so powerful and reliable.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Emily Chen',
    title: 'Head of Product',
    bio: 'Emily is a dedicated product leader with a sharp eye for user experience and design. With a background in market research and a deep understanding of student needs, she shapes the features and roadmap of Grad Tracker. She’s the voice of our users, ensuring that the platform is not only powerful but also intuitive and delightful to use.',
    image: 'https://www.sharepointeurope.com/wp-content/uploads/2024/06/Emily_Chen.jpg',
  },
];

const coreValues = [
  {
    title: 'Student-First Design',
    description: 'Every feature is built with the student’s needs in mind. We prioritize simplicity, clarity, and effectiveness to reduce stress and make the process more enjoyable. We listen to our community and build a tool that truly serves them.',
    icon: '🧑‍🎓',
  },
  {
    title: 'Commitment to Quality',
    description: 'We believe in building a reliable, secure, and bug-free platform. Our commitment to quality ensures a smooth user experience, so you can focus on your applications without worrying about technical issues.',
    icon: '🌟',
  },
  {
    title: 'Continuous Innovation',
    description: 'The world of academia and technology is always evolving. We are committed to constantly innovating and updating our features to stay ahead of the curve and provide the most relevant tools for your journey.',
    icon: '🚀',
  },
];

const impactStats = [
  {
    stat: '10,000+',
    label: 'Applications Tracked',
  },
  {
    stat: '25,000+',
    label: 'Students Empowered',
  },
  {
    stat: '100,000+',
    label: 'Hours Saved',
  },
];

const AboutPage: React.FC = () => {
  const { currentUser } = useAuth(); // Get the current user's login status

  const renderCtaButton = () => {
    if (currentUser) {
      return (
        <Link to="/dashboard">
          <button className="bg-accent text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400">
            Go to Dashboard
          </button>
        </Link>
      );
    } else {
      return (
        <Link to="/signup">
          <button className="bg-accent text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400">
            Get Started for Free
          </button>
        </Link>
      );
    }
  };

  return (
    <div className="bg-neutral-100 min-h-screen py-20 pb-2">
      
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32 flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: 'url(https://www.beyondabroad.org/wp-content/uploads/2021/06/table-with-laptops.jpg)' }}
          role="img"
          aria-label="A table with laptops and people working on them, symbolizing collaboration and productivity."
        >
          <div className="absolute inset-0 bg-secondary opacity-70"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight animate-slide-up">
            Our Story. Our Mission. Our <span className="text-primary">Passion.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-slide-up animation-delay-300">
            We are dedicated to building the ultimate tool for students navigating the graduate school application process. Our journey began with a simple problem, and our passion is to empower your success.
          </p>
        </div>
      </section>

      {/* Our Story Section: The Problem & The Solution */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 animate-slide-up">
              <h2 className="text-3xl font-extrabold text-secondary mb-4">The Problem: A World of Chaos</h2>
              <p className="text-lg text-neutral-500 space-y-4 leading-relaxed">
                The graduate school application process is a rite of passage, but for many, it's also an overwhelming gauntlet of deadlines, forms, and scattered information. We know this firsthand because we lived it. The endless struggle of juggling different university portals, tracking down professor emails, and trying to keep a spreadsheet updated felt inefficient, stressful, and prone to error. We realized this wasn't just a challenge—it was a problem that needed a dedicated solution.
              </p>
              <p className="text-lg text-neutral-500 mt-4 leading-relaxed">
                This moment of shared frustration became the spark for Grad Tracker. We envisioned a single, intuitive platform that could bring order to this chaos, allowing students to focus on what truly matters: crafting a powerful application that reflects their potential.
              </p>
            </div>
            <div className="md:w-1/2 animate-slide-up animation-delay-200">
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Students collaborating on a project together."
                className="rounded-2xl shadow-lg w-full transform transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-secondary mb-8 animate-slide-up">
            Our Core Values
          </h2>
          <p className="text-lg text-neutral-500 max-w-3xl mx-auto mb-12 animate-slide-up animation-delay-200">
            Our values are the foundation of everything we do. They guide our decisions and define the experience we want to create for our users. We believe that by adhering to these principles, we can empower students to achieve their academic goals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-neutral-100 shadow-md border border-neutral-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-secondary mb-2">{value.title}</h3>
                <p className="text-neutral-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="bg-neutral-100 py-16 sm:py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-secondary mb-12 animate-slide-up">
            Our Impact, by the Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStats.map((item, index) => (
              <div 
                key={index} 
                className="p-8 bg-white rounded-2xl shadow-lg border border-neutral-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-6xl font-extrabold text-primary mb-2">
                  {item.stat}
                </div>
                <p className="text-lg font-semibold text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Testimonial Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-xl italic text-neutral-500 mb-8 animate-fade-in">
            "Grad Tracker was a complete game-changer for me. It transformed my application process from a stressful, disorganized mess into a clear, manageable journey. I landed my dream program, and I owe a huge part of my success to this platform."
          </p>
          <p className="font-semibold text-secondary text-lg">- Alex M., MIT Graduate Student</p>
        </div>
      </section>
      
      {/* Our Team Section - Enhanced Card Design */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-secondary mb-12 animate-slide-up">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-md"
                />
                <h3 className="text-xl font-semibold text-secondary mt-6">{member.name}</h3>
                <p className="text-primary mt-1 mb-4">{member.title}</p>
                <p className="text-neutral-500">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final Call to Action Section */}
      <section className="bg-primary py-20 sm:py-28">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 animate-slide-up">
            Ready to Take Control of Your Future?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
            {currentUser ? "You're already part of the family. Head to your dashboard to manage your applications and get started!" : "Join thousands of students who are simplifying their application process. Sign up for free today and get started."}
          </p>
          {renderCtaButton()}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;