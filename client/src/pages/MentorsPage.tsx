import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaTimes } from 'react-icons/fa';

// Define the type for a mentor object
interface Mentor {
  id: number;
  name: string;
  title: string;
  image: string;
  bio: string;
  expertise: string[];
  contactInfo: string;
}

// --- Animation variants (reusing from BlogPage) ---
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

// Sample mentor data
const mentors: Mentor[] = [
//  {
//    id: 1,
//    name: 'Dr. Jane Doe',
//    title: 'Professor of Computer Science',
//    image: 'https://images.unsplash.com/photo-1542152648-c32274483733?w=800&q=80&auto=format&fit=crop',
//    bio: 'Dr. Jane Doe is an expert in machine learning and natural language processing. She specializes in guiding students through research proposals and academic writing.',
//    expertise: ['Machine Learning', 'NLP', 'Research Proposals'],
//    contactInfo: 'jane.doe@university.edu'
//  },
];

export default function MentorsPage() {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const openModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  const closeModal = () => {
    setSelectedMentor(null);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen font-sans bg-neutral-light text-neutral-900 py-20 pb-2">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900">Meet Our Mentors</h1>
          <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-700">
            Connect with experienced professionals who can guide you through your graduate school journey.
          </p>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="container mx-auto px-6 py-14">
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {mentors.map((mentor) => (
            <motion.div 
              key={mentor.id} 
              variants={item} 
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
              onClick={() => openModal(mentor)}
            >
              <img src={mentor.image} alt={mentor.name} className="w-full h-48 object-cover" />
              <div className="p-6 text-center">
                <h4 className="font-bold text-xl mt-2 text-secondary">{mentor.name}</h4>
                <p className="mt-1 text-sm text-neutral-dark">{mentor.title}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Modal for Mentor Profile */}
      <AnimatePresence>
        {selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-neutral-dark hover:text-secondary transition z-10"
              >
                <FaTimes size={24} />
              </button>
              <img src={selectedMentor.image} alt={selectedMentor.name} className="w-full h-72 object-cover rounded-t-3xl" />
              <div className="p-8">
                <h2 className="text-3xl font-bold text-secondary">{selectedMentor.name}</h2>
                <p className="text-lg text-neutral-dark mt-2">{selectedMentor.title}</p>
                <p className="mt-4 text-neutral-dark text-lg leading-relaxed">{selectedMentor.bio}</p>
                
                <h3 className="text-xl font-bold mt-6 text-secondary">Areas of Expertise</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMentor.expertise.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <a 
                    href={`mailto:${selectedMentor.contactInfo}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
                  >
                    <FaUserCircle /> Contact {selectedMentor.name}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}