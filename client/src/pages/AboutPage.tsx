/* eslint-disable no-irregular-whitespace */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Reusing the same animation variants as the HomePage
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

const teamMembers = [
  {
    name: 'Jane Doe',
    title: 'Co-Founder & CEO',
    bio: "Jane is an expert in student success platforms with a background in education technology and a Master's degree from Stanford University. She built the first version of Grad Tracker on her kitchen table, driven by a passion for helping students achieve their academic goals without the stress she experienced. She leads our vision, ensuring every feature is truly student-first.",
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    name: 'John Smith',
    title: 'Co-Founder & CTO',
    bio: 'A brilliant software engineer and problem-solver, John holds a Computer Science degree from the Massachusetts Institute of Technology. He specializes in building scalable and intuitive web applications. John is the technical backbone of Grad Tracker, responsible for the robust data pipeline and seamless user experience that makes the platform so powerful and reliable.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3',
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
    description: 'Every feature is built with the student’s needs in mind. We prioritize simplicity, clarity, and effectiveness to reduce stress and make the process more enjoyable.',
    icon: '🧑‍🎓',
  },
  {
    title: 'Commitment to Quality',
    description: 'We believe in building a reliable, secure, and bug-free platform. Our commitment to quality ensures a smooth user experience, so you can focus on your applications.',
    icon: '🌟',
  },
  {
    title: 'Continuous Innovation',
    description: 'The world of academia and technology is always evolving. We are committed to constantly innovating and updating our features to provide the most relevant tools for your journey.',
    icon: '🚀',
  },
];

const impactStats = [
  {
    stat: 10000,
    suffix: '+',
    label: 'Applications Tracked',
  },
  {
    stat: 25000,
    suffix: '+',
    label: 'Students Empowered',
  },
  {
    stat: 100000,
    suffix: '+',
    label: 'Hours Saved',
  },
];

export default function AboutPage() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-neutral-100 min-h-screen font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 z-0"></div>
        {/* Floating soft shapes */}
        <motion.div
          className="absolute z-0 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          style={{ top: '6%', left: '-8%' }}
        />
        <motion.div
          className="absolute z-0 w-96 h-96 bg-blue-300 rounded-full opacity-18 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 10 }}
          style={{ bottom: '2%', right: '-12%' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl px-4 z-10"
        >
          <h1 className="text-5xl font-bold mb-4 text-blue-900">Our Story. Our Mission. Our <span className="text-primary">Passion.</span></h1>
          <p className="text-lg opacity-90 text-neutral-dark">We are dedicated to building the ultimate tool for students navigating the graduate school application process.</p>
        </motion.div>
      </section>

      {/* Problem & Solution */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-blue-900 mb-4">The Problem: A World of Chaos</h2>
            <p className="text-neutral-dark leading-relaxed mb-4">The graduate school application process is overwhelming. We experienced it ourselves — juggling portals, deadlines, and emails — and realized there had to be a better way.</p>
            <p className="text-neutral-dark leading-relaxed">Grad Tracker was born to bring order to the chaos, letting students focus on building powerful applications that reflect their potential.</p>
          </motion.div>
          <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3" alt="Students collaborating" className="rounded-2xl shadow-lg" />
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-neutral-100 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">Our Core Values</h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-transform hover:scale-105"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">{value.title}</h3>
                <p className="text-neutral-dark">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-gradient"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {impactStats.map((stat, i) => (
            <motion.div
              key={i}
              variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}
            >
              <div className="text-5xl font-bold drop-shadow-lg"><CountUp end={stat.stat} suffix={stat.suffix} /></div>
              <div className="opacity-90 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xl italic text-neutral-dark mb-6"
          >
            "Grad Tracker transformed my application process into a clear, manageable journey. I landed my dream program thanks to this platform."
          </motion.p>
          <p className="font-semibold text-blue-900">- Alex M., MIT Graduate Student</p>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="bg-neutral-100 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">Meet the Team</h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-10">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
              >
                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-md" />
                <h3 className="text-xl font-semibold text-blue-900 mt-6">{member.name}</h3>
                <p className="text-primary mt-1 mb-4">{member.title}</p>
                <p className="text-neutral-dark text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      {!currentUser && (
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-blue-100 z-0"></div>
          <motion.div
            className="absolute z-0 w-80 h-80 bg-blue-200 rounded-full opacity-16 blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 9 }}
            style={{ top: '12%', left: '-6%' }}
          />
          <motion.div
            className="absolute z-0 w-96 h-96 bg-blue-300 rounded-full opacity-14 blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 11 }}
            style={{ bottom: '6%', right: '-10%' }}
          />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/50">
              <h3 className="text-3xl font-bold text-blue-800">Ready to take control of your future?</h3>
              <p className="max-w-2xl mx-auto mt-3 text-gray-700">Join thousands of students simplifying their application process. Sign up for free today.</p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link to="/signup">
                  <motion.button {...floatBtn} className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow hover:bg-blue-600 transition">
                    Create free account
                  </motion.button>
                </Link>
                <Link to="/contact" className="underline text-blue-700">Contact sales</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}