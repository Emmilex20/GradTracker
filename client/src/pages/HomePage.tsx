import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoCheckmarkCircle, IoArrowForwardCircle } from 'react-icons/io5';

// Import the useAuth hook to get the user's login status
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed

const HomePage: React.FC = () => {
  // Use the useAuth hook to get the current user
  const { currentUser } = useAuth();
  // We no longer need the local isLoggedIn state, as we can check currentUser
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: "How does Grad Tracker help with my applications?",
      answer: "Grad Tracker provides a visual kanban board to organize applications, tracks all your deadlines, and helps you find new graduate programs, all in one place.",
    },
    {
      question: "Is Grad Tracker free to use?",
      answer: "Yes! You can sign up for a free account with limited features. We also offer a premium plan for students who want access to all our advanced tools and resources.",
    },
    {
      question: "Can I collaborate with my mentors or advisors?",
      answer: "Our premium plan includes collaboration features, allowing you to share your progress and notes with mentors and advisors for seamless feedback.",
    },
  ];

  return (
    <div className="bg-neutral-100 min-h-screen py-20 pb-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white flex items-center justify-center min-h-screen-minus-nav">
        {/* Background Image and Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        >
          <div className="absolute inset-0 bg-secondary opacity-70"></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 text-center relative z-10 py-24 sm:py-32 animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight animate-slide-up">
            {currentUser ? (
              <>Welcome Back, <span className="text-primary">Ready to Track?</span></>
            ) : (
              <>Your Grad School Journey, <span className="text-primary">Mastered.</span></>
            )}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-4xl mx-auto animate-slide-up animation-delay-300">
            {currentUser ? (
              "Your personalized dashboard is waiting for you. Dive back into your applications and stay on top of your deadlines."
            ) : (
              "From application deadlines to professor emails, manage every step of your graduate school journey in one beautiful, organized platform."
            )}
          </p>
          <div className="mt-12 flex justify-center space-x-4 sm:space-x-6 animate-slide-up animation-delay-500">
            {currentUser ? (
              <Link to="/dashboard">
                <button className="bg-primary text-white font-bold py-4 px-8 sm:py-4 sm:px-10 rounded-full text-lg shadow-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <button className="bg-primary text-white font-bold py-4 px-8 sm:py-4 sm:px-10 rounded-full text-lg shadow-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300">
                    Get Started for Free
                  </button>
                </Link>
                <Link to="/features">
                  <button className="bg-white text-secondary font-bold py-4 px-8 sm:py-4 sm:px-10 rounded-full text-lg border-2 border-neutral-300 hover:bg-neutral-200 transform hover:scale-105 transition-all duration-300">
                    Learn More
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* The rest of your component remains the same */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-12">
            Features Designed for Your Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 text-center animate-slide-up">
              <span className="text-4xl text-primary mb-4 block">📝</span>
              <h3 className="text-xl font-semibold text-secondary mb-2">Kanban Board</h3>
              <p className="text-neutral-500">
                Organize applications visually with a drag-and-drop board.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 text-center animate-slide-up animation-delay-100">
              <span className="text-4xl text-primary mb-4 block">🗓️</span>
              <h3 className="text-xl font-semibold text-secondary mb-2">Deadline Tracking</h3>
              <p className="text-neutral-500">
                Never miss a deadline with automated reminders and a unified calendar.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 text-center animate-slide-up animation-delay-200">
              <span className="text-4xl text-primary mb-4 block">🔎</span>
              <h3 className="text-xl font-semibold text-secondary mb-2">Program Search</h3>
              <p className="text-neutral-500">
                Discover new programs with our curated, automatically updated database.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 text-center animate-slide-up animation-delay-300">
              <span className="text-4xl text-primary mb-4 block">💬</span>
              <h3 className="text-xl font-semibold text-secondary mb-2">Feedback & Notes</h3>
              <p className="text-neutral-500">
                Keep detailed notes and feedback for each application in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
            {/* Step 1 */}
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Create Your Account</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">
                Sign up in minutes and start building your profile. It's quick, easy, and free.
              </p>
              <div className="hidden lg:block absolute right-[-6rem] top-1/2 -translate-y-1/2 w-24 border-t-2 border-dashed border-neutral-300"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Add Your Programs</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">
                Use our database to add the graduate programs you're interested in applying to.
              </p>
              <div className="hidden lg:block absolute right-[-6rem] top-1/2 -translate-y-1/2 w-24 border-t-2 border-dashed border-neutral-300"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Track & Manage</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">
                Monitor deadlines, track your application status, and stay on top of all your tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* In-depth Feature Showcase: Kanban Board */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="lg:flex lg:items-center lg:space-x-12 mb-16">
            <div className="lg:w-1/2">
              <img
                src="https://images.ctfassets.net/w6r2i5d8q73s/6wpAeUvjqESIFd6ayYpLcR/d19af2d0b32be76f1a8d64860e8fafbe/agile_kanban_product-image_EN_big_3_2.png"
                alt="Kanban Board Screenshot"
                className="rounded-2xl shadow-2xl mb-8 lg:mb-0 transform hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-secondary mb-4">
                Organize Your World with Our Kanban Board
              </h2>
              <p className="text-lg text-neutral-500 mb-6">
                Our intuitive drag-and-drop kanban board lets you visualize your entire application pipeline. See what’s in progress, what's pending, and what’s complete at a glance.
              </p>
              <ul className="text-neutral-500 text-lg space-y-3">
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>Visualize every step of your application journey.</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>Easily move applications between different stages.</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>Attach notes, documents, and deadlines to each card.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* In-depth Feature Showcase: Deadline Tracking */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:space-x-12">
            <div className="lg:w-1/2">
              <img
                src="https://images.pexels.com/photos/5060979/pexels-photo-5060979.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Deadline Tracking Screenshot"
                className="rounded-2xl shadow-2xl mb-8 lg:mb-0 transform hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-secondary mb-4">
                Never Miss a Deadline Again
              </h2>
              <p className="text-lg text-neutral-500 mb-6">
                Our integrated calendar and automated reminders ensure you're always on top of application deadlines, recommendation letter requests, and other important dates.
              </p>
              <ul className="text-neutral-500 text-lg space-y-3">
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>Automated email and in-app notifications.</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>Syncs with your personal calendar (Google, Outlook).</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <IoCheckmarkCircle className="text-primary text-2xl mr-2 flex-shrink-0" />
                  <span>View deadlines at a glance on your dashboard.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Authority Section */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-12">
            Trusted by students at leading universities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {/* Placeholder university logos */}
            <img src="https://static.vecteezy.com/system/resources/previews/021/996/239/non_2x/university-logo-design-vector.jpg" alt="University Logo" className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSlbc0XcxwgPqJ0uC5bFdqBGsFbLTwv0NoEx4a6SLWBkJCljaAnhOveq3S_qwtLvTKO1k&usqp=CAU" alt="University Logo" className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
            <img src="https://bcassetcdn.com/public/blog/wp-content/uploads/2022/05/11161506/Harvard-University-Logo.png" alt="University Logo" className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
            <img src="https://m.media-amazon.com/images/I/71yQYMM1mrL._UF350,350_QL80_.jpg" alt="University Logo" className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
            <img src="https://bcassetcdn.com/public/blog/wp-content/uploads/2022/05/11161532/Chicago-University-Logo.png" alt="University Logo" className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </section>

      {/* Social Proof/Testimonials Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-12">
            What Our Users Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-100 p-8 rounded-2xl shadow-inner-lg animate-slide-up">
              <p className="italic text-neutral-500 mb-4">
                "Grad Tracker was a game-changer. I went from scattered notes to a crystal-clear, organized process. Highly recommend!"
              </p>
              <p className="font-semibold text-secondary">- Alex M.</p>
              <p className="text-sm text-neutral-400">Future Ph.D. Student</p>
            </div>
            <div className="bg-neutral-100 p-8 rounded-2xl shadow-inner-lg animate-slide-up animation-delay-100">
              <p className="italic text-neutral-500 mb-4">
                "The automated program discovery saved me countless hours. It's the only tool you need to manage your applications."
              </p>
              <p className="font-semibold text-secondary">- Dr. Sarah P.</p>
              <p className="text-sm text-neutral-400">University of Cambridge</p>
            </div>
            <div className="bg-neutral-100 p-8 rounded-2xl shadow-inner-lg animate-slide-up animation-delay-200">
              <p className="italic text-neutral-500 mb-4">
                "The kanban board is fantastic! It made tracking my deadlines and application statuses so easy and intuitive."
              </p>
              <p className="font-semibold text-secondary">- Jessica R.</p>
              <p className="text-sm text-neutral-400">Graduate Student, MIT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Spotlight Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center lg:flex lg:items-center lg:text-left space-y-8 lg:space-y-0 lg:space-x-12">
          <div className="lg:w-1/3 flex justify-center">
            <img
              src="https://img.freepik.com/free-photo/portrait-male-student-with-books_23-2148882426.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Customer"
              className="w-48 h-48 rounded-full object-cover shadow-xl"
            />
          </div>
          <div className="lg:w-2/3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-secondary mb-4">
              "My dream school was within reach, thanks to Grad Tracker."
            </h3>
            <p className="italic text-lg text-neutral-500 mb-6">
              "I was overwhelmed with all the requirements for my top-choice program. Grad Tracker's tools helped me break down the process into manageable steps. The deadline reminders were a lifesaver, and I felt confident and in control the entire time. I couldn't have done it without this platform!"
            </p>
            <p className="font-semibold text-secondary">- Michael B., University of California, Berkeley</p>
          </div>
        </div>
      </section>

      {/* Latest from Our Blog Section */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-12">
            Latest from Our Blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <img
                src="https://ichef.bbci.co.uk/images/ic/976x549/p08zhw6w.jpg"
                alt="Blog Article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  <a href="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bbc.co.uk%2Fbitesize%2Farticles%2Fzb8pxbk&psig=AOvVaw1ngDEikYqV5jziDGA41jT-&ust=1754699752273000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNiNppX8-Y4DFQAAAAAdAAAAABAE" className="hover:text-primary transition-colors duration-300" target='_blank'>
                    5 Tips for Writing a Standout Personal Statement
                  </a>
                </h3>
                <p className="text-neutral-500 text-sm">
                  A deep dive into crafting a powerful and memorable personal statement that will get you noticed.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <img
                src="https://thephmillennial.com/wp-content/uploads/2019/08/Copy-of-Copy-of-Copy-of-Copy-of-Copy-of-Copy-of-Copy-of-what-to-din-times-14.png"
                alt="Blog Article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  <a href="https://www.google.com/url?sa=i&url=https%3A%2F%2Fthephmillennial.com%2Fa-simple-guide-to-crush-your-first-semester-of-graduate-school%2F&psig=AOvVaw0pwA3TsRj0nDXzzVkIL2KD&ust=1754699949968000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNim4-38-Y4DFQAAAAAdAAAAABAE" className="hover:text-primary transition-colors duration-300" target='_blank'>
                    Navigating Your First Semester of Graduate School
                  </a>
                </h3>
                <p className="text-neutral-500 text-sm">
                  Practical advice and strategies for a smooth transition into your graduate studies.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <img
                src="https://i.ytimg.com/vi/iq_KAQ2k0Yg/maxresdefault.jpg"
                alt="Blog Article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  <a href="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Diq_KAQ2k0Yg&psig=AOvVaw0LVp3uzMZVdSBmA73smszS&ust=1754700028585000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLi8hpT9-Y4DFQAAAAAdAAAAABAE" className="hover:text-primary transition-colors duration-300" target='_blank'>
                    The Ultimate Guide to Securing Recommendation Letters
                  </a>
                </h3>
                <p className="text-neutral-500 text-sm">
                  Learn how to approach professors and secure strong letters of recommendation.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/blog">
              <button className="bg-white text-secondary font-bold py-3 px-8 rounded-full text-lg border-2 border-neutral-300 hover:bg-neutral-200 transform hover:scale-105 transition-all duration-300">
                View All Articles
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-neutral-300 py-4">
                <button
                  className="flex justify-between items-center w-full text-left text-lg font-semibold text-secondary"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span>{item.question}</span>
                  <IoArrowForwardCircle
                    className={`text-2xl transition-transform duration-300 ${openFAQ === index ? 'rotate-90 text-primary' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-max-h duration-500 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-neutral-500 pt-2">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section with Image */}
      {!currentUser && (
        <section
          className="relative overflow-hidden py-16 sm:py-24"
          style={{
            backgroundImage: 'url(https://blog.aifsabroad.com/wp-content/uploads/2020/02/aifs-study-abroad-preparation-research.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-primary opacity-50"></div> {/* Overlay for text contrast */}
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              Ready to Take Control of Your Future?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join thousands of students who are simplifying their application process. Sign up for free today and get started.
            </p>
            <Link to="/signup">
              <button className="bg-accent text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-pink-600 transform hover:scale-105 transition-all duration-300">
                Start Your Free Account
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;