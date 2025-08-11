import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Visual Kanban Dashboard',
    description: "Organize your applications with a drag-and-drop kanban board. Easily track each application's status, from 'Interested' to 'Submitted' and beyond. Visualize your progress at a glance.",
    icon: '📊',
    image: 'https://images.ctfassets.net/w6r2i5d8q73s/6wpAeUvjqESIFd6ayYpLcR/d19af2d0b32be76f1a8d64860e8fafbe/agile_kanban_product-image_EN_big_3_2.png',
  },
  {
    title: 'Integrated Communication Hub',
    description: 'Keep all your communication related to applications in one organized place. Log emails, notes from calls, and important contact information effortlessly.',
    icon: '✉️',
    image: 'https://img.freepik.com/free-vector/illustration-business-people_53876-58974.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    title: 'Automated Program & Scholarship Discovery',
    description: 'Discover relevant graduate programs and scholarship opportunities tailored to your profile and interests. Our smart algorithms do the heavy lifting for you.',
    icon: '⚙️',
    image: 'https://d3bkbkx82g74b8.cloudfront.net/eyJidWNrZXQiOiJsYWJyb290cy1pbWFnZXMiLCJrZXkiOiJzY2hvbGFyc2hpcF9wcm9maWxlX2ltYWdlXzNhZjQ3MGNiNWQ3ZjJhNDE1ODEwOWMzNmI4ODdmNzczNDI0OTNlNTNfMjUyMi5wbmciLCJlZGl0cyI6eyJ0b0Zvcm1hdCI6ImpwZyIsInJlc2l6ZSI6eyJ3aWR0aCI6OTAwLCJoZWlnaHQiOjQ1MCwiZml0IjoiY292ZXIiLCJwb3NpdGlvbiI6ImNlbnRlciIsImJhY2tncm91bmQiOiIjZmZmIn0sImZsYXR0ZW4iOnsiYmFja2dyb3VuZCI6IiNmZmYifX19',
  },
  {
    title: 'Comprehensive Notes & Deadline Management',
    description: 'Attach detailed notes, upload documents, and set reminders for every application. Our system ensures you never miss a crucial deadline or forget important details.',
    icon: '📝',
    image: 'https://www.shutterstock.com/image-photo/business-planning-calendar-agenda-work-600nw-2461973363.jpg',
  },
  {
    title: 'Progress Visualization & Analytics',
    description: 'Track your overall progress with insightful charts and analytics. Understand where you stand with your applications and identify areas needing attention.',
    icon: '📈',
    image: 'https://pce.sandiego.edu/wp-content/uploads/2022/03/usd-pce-data-analytics-visualization.jpeg',
  },
  {
    title: 'Secure Cloud Storage',
    description: 'Your data and documents are securely stored in the cloud, accessible from any device, anytime. Focus on your applications, knowing your information is safe.',
    icon: '🔒',
    image: 'https://assets.esecurityplanet.com/uploads/2024/01/esp_20240117-how-secure-is-cloud-storage.png',
  },
];

const testimonials = [
  {
    quote: "Grad Tracker was a game-changer for my application process. I've never felt more organized and in control. The kanban board is incredibly intuitive!",
    name: "Alex P.",
    school: "UCLA, Accepted PhD Program",
  },
  {
    quote: "I used to track everything in a messy spreadsheet. Grad Tracker's centralized hub for notes and communications saved me countless hours.",
    name: "Maria L.",
    school: "Stanford, Accepted Master's Program",
  },
  {
    quote: "The automated program discovery feature helped me find a scholarship I never would have known about otherwise. Highly recommend!",
    name: "Jasmine T.",
    school: "MIT, Accepted Master's Program",
  },
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Create Your Account",
    description: "Sign up in minutes to create your personalized Grad Tracker dashboard.",
    image: "https://example.com/step1-image.png" // Replace with actual image
  },
  {
    step: 2,
    title: "Add Applications",
    description: "Easily add graduate programs and scholarships you are interested in. Fill in key details like deadlines and requirements.",
    image: "https://example.com/step2-image.png" // Replace with actual image
  },
  {
    step: 3,
    title: "Track Your Progress",
    description: "Use our visual kanban board to move applications through different stages. Add notes, documents, and reminders along the way.",
    image: "https://example.com/step3-image.png" // Replace with actual image
  },
  {
    step: 4,
    title: "Succeed & Celebrate!",
    description: "Stay on top of every deadline and requirement. When the acceptances roll in, you'll be ready to make an informed decision.",
    image: "https://example.com/step4-image.png" // Replace with actual image
  },
];

const FeaturesPage: React.FC = () => {
  const { currentUser } = useAuth();

  const renderCtaButton = () => {
    if (currentUser) {
      return (
        <Link to="/dashboard">
          <button className="bg-secondary text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400">
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32 flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: 'url(https://www.beyondabroad.org/wp-content/uploads/2021/06/one-hand-pointing-at-the-laptop-the-other-person-is-writing-on-the-laptop.jpg)' }}
          role="img"
          aria-label="Student writing notes while looking at a laptop"
        >
          <div className="absolute inset-0 bg-secondary opacity-60"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight animate-slide-up">
            Unlock Your Graduate School Dreams with <span className="text-primary">Grad Tracker</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto animate-slide-up animation-delay-300">
            Discover the features that will revolutionize your application process, keeping you organized, informed, and confident every step of the way.
          </p>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-12 animate-slide-up">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mx-auto w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-2">{step.title}</h3>
                <p className="text-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-12 animate-slide-up">
            Explore Our Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <img src={feature.image} alt={`Visual representation of ${feature.title}`} className="w-full h-60 object-cover" />
                  <div className="absolute top-4 left-4 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl">
                    {feature.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary mb-3">{feature.title}</h3>
                  <p className="text-neutral-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-12 animate-slide-up">
            What Our Users Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-neutral-100 p-8 rounded-2xl shadow-lg border-l-4 border-primary text-left animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <p className="text-lg text-neutral-600 italic mb-4">"{testimonial.quote}"</p>
                <div className="font-bold text-secondary">{testimonial.name}</div>
                <div className="text-sm text-neutral-500">{testimonial.school}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Grad Tracker Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-12 animate-slide-up">
            Why Choose Grad Tracker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="text-left animate-slide-up">
              <h3 className="text-2xl font-semibold text-primary mb-4">Stay Organized & On Track</h3>
              <p className="text-neutral-500 mb-6">
                Our platform provides a centralized hub for all your application-related information, ensuring you never lose track of important details or deadlines.
              </p>
              <h3 className="text-2xl font-semibold text-primary mb-4">Save Time & Effort</h3>
              <p className="text-neutral-500 mb-6">
                From automated program discovery to pre-written email templates, Grad Tracker is designed to streamline your workflow and save you valuable time.
              </p>
            </div>
            <div className="text-left animate-slide-up animation-delay-200">
              <h3 className="text-2xl font-semibold text-primary mb-4">Make Informed Decisions</h3>
              <p className="text-neutral-500 mb-6">
                Access a wealth of information about programs and scholarships, empowering you to make the best choices for your academic future.
              </p>
              <h3 className="text-2xl font-semibold text-primary mb-4">Reduce Stress & Anxiety</h3>
              <p className="text-neutral-500 mb-6">
                By providing clarity and organization, Grad Tracker helps to alleviate the stress and anxiety often associated with the graduate school application process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kanban Dashboard Visual Section */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-12 animate-slide-up">
            Visualize Your Progress with the Kanban Dashboard
          </h2>
          <img
            src="https://kanbanboard.co.uk/public/storage/uploads/page/1724051548_1724051218_kanbanboards.png"
            alt="Kanban Dashboard Preview"
            className="rounded-lg shadow-lg mx-auto animate-fade-in"
          />
          <p className="mt-8 text-lg text-neutral-500 max-w-2xl mx-auto animate-slide-up">
            Easily move applications between stages, customize your workflow, and get a clear overview of your application pipeline.
          </p>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="bg-primary py-20 sm:py-28">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 animate-slide-up">
            Ready to Transform Your Graduate School Application Experience?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
            {currentUser ? "Head to your dashboard to manage your applications and get started!" : "Sign up for Grad Tracker today and take the first step towards a more organized, efficient, and successful application journey."}
          </p>
          {renderCtaButton()}
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;