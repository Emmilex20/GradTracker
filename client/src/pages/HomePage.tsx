import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaGraduationCap,
    FaShieldAlt,
    FaCheckCircle,
    FaBolt,
    FaStar,
    FaTimes, // Import FaTimes for the close button
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { platformFeatures, steps, featuredScholarships, testimonials, blogPosts, type Scholarship, type Feature } from '../data/homePageData';

// --- Modal Component ---
interface FeatureModalProps {
    feature: Feature | null;
    onClose: () => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()} // Prevents closing when clicking inside the modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <FaTimes size={24} />
                </button>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-secondary mb-4">{feature.title}</h3>
                        <p className="text-neutral-dark whitespace-pre-wrap">{feature.fullDesc}</p>
                    </div>
                    {feature.fullImage && (
                        <div className="flex-1 flex items-center justify-center">
                            <img
                                src={feature.fullImage}
                                alt={feature.title}
                                className="rounded-lg shadow-md w-full md:w-auto md:max-w-xs object-cover"
                            />
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:opacity-95 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Small helper: animated counter ---
interface CountUpProps {
    end: number;
    suffix?: string;
    duration?: number;
}

const CountUp: React.FC<CountUpProps> = ({ end, suffix = '', duration = 1200 }) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.max(1, Math.ceil((end - start) / (duration / 16)));
        const id = setInterval(() => {
            start += step;
            if (start >= end) {
                setValue(end);
                clearInterval(id);
            } else setValue(start);
        }, 16);
        return () => clearInterval(id);
    }, [end, duration]);
    return <span>{value.toLocaleString()}{suffix}</span>;
};

// --- Outstanding Loader Component ---
const OutstandingLoader: React.FC = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="relative flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl animate-pulse-slow"
            ></motion.div>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className="relative z-10 p-6 bg-white rounded-full shadow-2xl"
            >
                <FaBolt className="text-6xl text-primary animate-spin-slow" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-lg font-semibold text-gray-600"
            >
                Loading Your Journey...
            </motion.p>
            <style>
                {`
                @keyframes pulse-slow {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 1.5s linear infinite;
                }
                `}
            </style>
        </div>
    </div>
);

// --- Animation variants ---
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// --- Scholarship card component ---
interface ScholarshipCardProps {
    school: Scholarship;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ school }) => (
    <motion.div variants={item} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-2">
        <img src={school.image} alt={school.name} className="h-44 w-full object-cover" />
        <div className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-lg text-secondary">{school.name}</h4>
                    <p className="text-sm text-neutral-dark">{school.location} • {school.level}</p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-600 font-semibold">{school.funding}</span>
            </div>
            <p className="mt-3 text-sm text-neutral-dark h-14 overflow-hidden">{school.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-neutral-dark">Deadline: <span className="font-semibold">{school.deadline}</span></div>
                <Link to="/program" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-95">Apply</Link>
            </div>
        </div>
    </motion.div>
);

export default function HomePage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [modalFeature, setModalFeature] = useState<Feature | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading ? (
                <OutstandingLoader key="loader" />
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="min-h-screen font-sans bg-neutral-light text-neutral-900 relative overflow-x-hidden"
                >
                    {/* Floating actions (desktop) */}
                    <div className="hidden lg:flex fixed top-1/3 right-6 flex-col gap-4 z-50">
                        <motion.div {...floatBtn} className="rounded-full overflow-hidden">
                            <Link to="/mentors" className="bg-white text-primary px-6 py-3 rounded-full shadow-md border border-primary font-semibold">Talk to Mentor</Link>
                        </motion.div>
                        <motion.div {...floatBtn} className="rounded-full overflow-hidden">
                            <Link to="/programs" className="bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-3 rounded-full shadow-md font-semibold">Search Now</Link>
                        </motion.div>
                    </div>

                   <motion.section
  initial="hidden"
  animate="show"
  variants={container}
  className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 bg-gradient-to-br from-blue-50 via-white to-blue-100"
>
  {/* Floating blobs */}
  <motion.div
    className="absolute z-0 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl"
    animate={{ y: [0, -40, 0], x: [0, 40, 0] }}
    transition={{ repeat: Infinity, duration: 10 }}
    style={{ top: "10%", left: "-10%" }}
  />
  <motion.div
    className="absolute z-0 w-[28rem] h-[28rem] bg-blue-400 rounded-full opacity-20 blur-3xl"
    animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
    transition={{ repeat: Infinity, duration: 12 }}
    style={{ bottom: "-5%", right: "-10%" }}
  />

  <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
    {/* Text Content */}
    <motion.div variants={item} className="flex-1 text-left">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-800 lg:text-blue-900 drop-shadow-sm">
        Grad School Applications, <br />
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Simplified for You.
        </span>
      </h1>
      <p className="mt-6 text-lg text-gray-600 max-w-2xl leading-relaxed">
        From program search to SOPs, CVs, reference letters and deadlines —
        GradManager makes the journey seamless in one powerful dashboard.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        {!currentUser ? (
          <Link
            to="/signup"
            className="relative px-8 py-4 rounded-full 
                       bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500
                       bg-[length:200%_200%] animate-gradient
                       text-white font-bold shadow-[0_0_25px_rgba(59,130,246,0.6)]
                       transition-all duration-500 transform hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.9)]"
          >
            <FaGraduationCap className="inline-block mr-2" />
            Join Us Now
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className="relative px-8 py-4 rounded-full 
                       bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500
                       bg-[length:200%_200%] animate-gradient
                       text-white font-bold shadow-[0_0_25px_rgba(59,130,246,0.6)]
                       transition-all duration-500 transform hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.9)]"
          >
            Go to Dashboard
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaBolt className="text-blue-600" /> Curated funded programs
        </div>
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-blue-600" /> Verified application info
        </div>
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-blue-600" /> Mentors & reviews
        </div>
      </div>
    </motion.div>

    {/* Image */}
    <motion.div variants={item} className="flex-1 relative hidden lg:block">
      <motion.img
        src="https://img.freepik.com/premium-photo/handsome-young-latin-american-man-smart-student-watching-webinar-online-class-using-laptop_695242-1819.jpg?semt=ais_hybrid&w=740&q=80"
        alt="Student using GradManager web app"
        className="rounded-3xl shadow-2xl w-full h-auto object-cover border-8 border-white"
        animate={{ y: ["0%", "-5%", "0%"] }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </motion.div>
  </div>
</motion.section>

                    
                    {/* What GradManager Offers */}
                    <section className="container mx-auto px-6 py-14">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold text-center text-secondary"
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                        >
                            What GradManager Offers.
                        </motion.h2>
                        <motion.p 
                          className="max-w-3xl mx-auto text-center mt-3 text-neutral-dark"
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{ delay: 0.1 }}
                        >
                            Everything from discovery to mentorship — built for applicants who want results and less stress.
                        </motion.p>
                        <motion.div
                            className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.1 }}
                        >
                            {platformFeatures.map((feat, i) => (
                                <motion.div
                                    key={i}
                                    variants={item}
                                    className="relative p-8 bg-white rounded-2xl shadow-lg border border-transparent overflow-hidden
                                               transform hover:scale-105 transition-all duration-300 group
                                               hover:shadow-xl"
                                >
                                    <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="rounded-full w-14 h-14 flex items-center justify-center bg-blue-100 text-primary mb-6">
                                            {feat.icon}
                                        </div>
                                        <h4 className="font-bold text-lg text-secondary pb-16 h-12 flex items-start">{feat.title}</h4>
                                        <div className="rounded-lg w-full h-48 flex-grow-0 flex-shrink-0 flex items-center justify-center mb-4 overflow-hidden relative">
                                            <img src={feat.src} alt={feat.title} className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                        <p className="mt-auto text-sm text-neutral-dark flex-grow whitespace-pre-wrap">{feat.desc}</p>
                                        
                                        {/* Added "See More" button here */}
                                        <button
                                            onClick={() => setModalFeature(feat)}
                                            className="mt-4 self-start text-sm text-primary font-semibold hover:underline transition"
                                        >
                                            Dashboard View
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* How it Works (Steps with images) */}
                    <section className="bg-gradient-to-r from-blue-50 to-white py-14">
                        <div className="container mx-auto px-6">
                            <h3 className="text-3xl font-bold text-center text-secondary">How it works — 4 simple steps</h3>
                            <p className="text-center max-w-2xl mx-auto mt-3 text-neutral-dark">From discovery to acceptance. Designed for clarity and speed.</p>
                            <div className="mt-10 grid md:grid-cols-2 gap-8">
                                {steps.map((s, i) => (
                                    <motion.div key={i} className="flex gap-6 items-center bg-white rounded-2xl p-6 shadow" variants={item}>
                                        <img src={s.img} alt={s.title} className="w-32 h-24 rounded-lg object-cover shadow-sm" />
                                        <div>
                                            <div className="flex items-center gap-3 text-primary font-semibold">{s.icon}<span>{i + 1}</span></div>
                                            <h4 className="font-bold text-lg mt-2">{s.title}</h4>
                                            <p className="text-sm text-neutral-dark mt-2 max-w-md">{s.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Scholarship Showcase */}
                    <section className="container mx-auto px-6 py-14">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-secondary">Featured Scholarships & Funding</h3>
                            <Link to="/programs" className="text-primary font-semibold">Browse all</Link>
                        </div>
                        <motion.div className="grid md:grid-cols-3 gap-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
                            {featuredScholarships.map((s, i) => <ScholarshipCard key={i} school={s} />)}
                        </motion.div>
                    </section>

                    {/* Video Walkthrough */}
                    <section className="py-14 bg-neutral-50">
                        <div className="container mx-auto px-6 text-center">
                            <h3 className="text-3xl font-bold text-secondary">See Grad Manager in action</h3>
                            <p className="max-w-2xl mx-auto mt-3 text-neutral-dark">Watch this short walkthrough to see how quickly you can find fully-funded programs and manage applications.</p>
                            <div className="mt-8 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl aspect-video">
                                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo" allowFullScreen className="w-full h-full"></iframe>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials & Success Stories */}
                    <section className="container mx-auto px-6 py-14">
                        <h3 className="text-3xl font-bold text-secondary text-center">Success stories</h3>
                        <p className="text-center max-w-2xl mx-auto mt-3 text-neutral-dark">Real people. Real offers. Real change.</p>
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                            <motion.div variants={item} className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-6">
                                    <img src={testimonials[0].image} alt={testimonials[0].name} className="w-20 h-20 rounded-lg object-cover shadow" />
                                    <div>
                                        <div className="font-bold text-xl">{testimonials[0].name}</div>
                                        <div className="text-sm opacity-90">{testimonials[0].role}</div>
                                    </div>
                                </div>
                                <blockquote className="mt-6 italic">"{testimonials[0].quote}"</blockquote>
                                <div className="mt-6 flex gap-3">
                                    <Link to="/stories" className="underline">Read full story</Link>
                                    <div className="ml-auto flex items-center gap-2">
                                        <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow">
                                <div className="flex items-center gap-4">
                                    <img src={testimonials[1].image} alt={testimonials[1].name} className="w-16 h-16 rounded-lg object-cover" />
                                    <div>
                                        <div className="font-bold">{testimonials[1].name}</div>
                                        <div className="text-sm opacity-90">{testimonials[1].role}</div>
                                    </div>
                                </div>
                                <p className="mt-4 text-neutral-dark">"{testimonials[1].quote}"</p>
                                <div className="mt-4">
                                    <Link to="/stories" className="text-primary font-semibold">More stories</Link>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                    
                    {/* Blog Section */}
                    <section className="container mx-auto px-6 py-14">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-bold text-secondary">GradManager Blog</h3>
                            <Link to="/blog" className="text-primary font-semibold hover:underline">Read all articles</Link>
                        </div>
                        <motion.div className="grid md:grid-cols-3 gap-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
                            {blogPosts.map((post, i) => (
                                <motion.div key={i} variants={item} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                                    <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <div className="text-sm text-neutral-dark">{post.date}</div>
                                        <h4 className="font-bold text-xl mt-2 text-secondary">{post.title}</h4>
                                        <p className="mt-2 text-neutral-dark text-sm">{post.blurb}</p>
                                        <div className="mt-4">
                                            <Link to="/blog" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                                                Read more <FaBolt />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* Community and impact counters */}
                    <section className="relative py-16 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-gradient bg-[length:400%_400%]"></div>
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
                        <div className="relative container mx-auto px-8 flex flex-wrap items-center justify-center gap-28 text-white text-center">
                            <div className="hover:scale-110 transition-transform duration-500">
                                <div className="font-bold text-4xl drop-shadow-lg">
                                    <CountUp end={300} suffix="+" />
                                </div>
                                <div className="opacity-90 text-lg">Mentors</div>
                            </div>
                            <div className="hover:scale-110 transition-transform duration-500">
                                <div className="font-bold text-4xl drop-shadow-lg">
                                    <CountUp end={2000} suffix="+" />
                                </div>
                                <div className="opacity-90 text-lg">Students helped</div>
                            </div>
                            <div className="hover:scale-110 transition-transform duration-500">
                                <div className="font-bold text-4xl drop-shadow-lg">
                                    <CountUp end={95} suffix="%" />
                                </div>
                                <div className="opacity-90 text-lg">Success rate</div>
                            </div>
                        </div>
                        <style>{`
                            @keyframes gradientAnimation {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                            .animate-gradient {
                                animation: gradientAnimation 8s ease infinite;
                            }
                        `}</style>
                    </section>

                    {/* FAQs */}
                    <section className="container mx-auto px-6 py-14">
                        <h3 className="text-3xl font-bold text-secondary text-center">Frequently asked questions</h3>
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h4 className="font-semibold">Are programs verified?</h4>
                                <p className="mt-2 text-sm text-neutral-dark">We verify funding types and application fees—but always include original program links so you can confirm details.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h4 className="font-semibold">How does document review work?</h4>
                                <p className="mt-2 text-sm text-neutral-dark">Upload drafts, pick a mentor or paid reviewer, and receive feedback with suggested edits and comments.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow">
                                <h4 className="font-semibold">Is Grad Manager free?</h4>
                                <p className="mt-2 text-sm text-neutral-dark">Yes — core discovery and tracking features are free. Premium services such as in-depth review are paid.</p>
                            </div>
                        </div>
                    </section>

                    {/* FINAL CTA */}
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
                                    <h3 className="text-3xl font-bold text-blue-800">Ready to find your funded path?</h3>
                                    <p className="max-w-2xl mx-auto mt-3 text-gray-700">Sign up free and get personalized matches — plus one free document review when you create your profile.</p>
                                    <div className="mt-6 flex items-center justify-center gap-4">
                                        <Link to="/signup" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-full shadow hover:bg-blue-700 transition">Create free account</Link>
                                        <Link to="/contact" className="underline text-blue-700">Contact sales</Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <AnimatePresence>
                        {modalFeature && <FeatureModal feature={modalFeature} onClose={() => setModalFeature(null)} />}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}