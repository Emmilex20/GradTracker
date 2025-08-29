import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FaGraduationCap, FaShieldAlt, FaBolt, FaCheckCircle, FaUserFriends, FaRegClock } from 'react-icons/fa';

// Animation variants for consistent, staggered reveals
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// Updated data with detailed, engaging text
const teamMembers = [
    {
        name: 'Jane Doe',
        title: 'Co-Founder & CEO',
        bio: "Jane is an expert in student success platforms with a background in education technology and a Master's degree from Stanford University. She built the first version of Grad Manager on her kitchen table, driven by a passion for helping students achieve their academic goals without the stress she experienced. She leads our vision, ensuring every feature is truly student-first.",
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop&ixlib=rb-4.0.3',
    },
    {
        name: 'John Smith',
        title: 'Co-Founder & CTO',
        bio: 'A brilliant software engineer and problem-solver, John holds a Computer Science degree from the Massachusetts Institute of Technology. He specializes in building scalable and intuitive web applications. John is the technical backbone of Grad Manager, responsible for the robust data pipeline and seamless user experience that makes the platform so powerful and reliable.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3',
    },
    {
        name: 'Emily Chen',
        title: 'Head of Product',
        bio: 'Emily is a dedicated product leader with a sharp eye for user experience and design. With a background in market research and a deep understanding of student needs, she shapes the features and roadmap of Grad Manager. She’s the voice of our users, ensuring that the platform is not only powerful but also intuitive and delightful to use.',
        image: 'https://www.sharepointeurope.com/wp-content/uploads/2024/06/Emily_Chen.jpg',
    },
];

const coreValues = [
    {
        title: 'User-Obsessed Design',
        description: 'Our design philosophy is simple: put the student first. We meticulously craft every feature, from the intuitive dashboard to the powerful search filters, to simplify your journey, reduce stress, and save you valuable time. Your success is our north star, and we believe the right tools should feel invisible, letting your ambition shine.',
        icon: <FaGraduationCap className="text-4xl text-primary" />,
    },
    {
        title: 'Built for Reliability',
        description: 'Applying for graduate school is stressful enough without technology glitches. We are committed to building a platform that is not just powerful, but also secure, reliable, and bug-free. Your data is protected, your deadlines are tracked accurately, and our system is always running smoothly, so you can focus on building your future with confidence.',
        icon: <FaShieldAlt className="text-4xl text-primary" />,
    },
    {
        title: 'Evolving with You',
        description: 'The academic landscape is constantly changing. We embrace this by continuously innovating and updating our features. Whether it’s integrating new AI-powered tools for essay writing or expanding our database of scholarships, we are dedicated to providing the most relevant and cutting-edge resources to help you stay ahead of the curve.',
        icon: <FaBolt className="text-4xl text-primary" />,
    },
];

const impactStats = [
    {
        stat: 10000,
        suffix: '+',
        label: 'Applications Managed',
        icon: <FaCheckCircle className="text-4xl text-white" />,
    },
    {
        stat: 25000,
        suffix: '+',
        label: 'Students Empowered',
        icon: <FaUserFriends className="text-4xl text-white" />,
    },
    {
        stat: 100000,
        suffix: '+',
        label: 'Hours Saved',
        icon: <FaRegClock className="text-4xl text-white" />, // Using FaTimes as a placeholder for a new "time" icon
    },
];

const testimonials = [
    {
        name: 'Alex M.',
        role: 'MIT Graduate Student',
        quote: 'Grad Manager transformed my application process into a clear, manageable journey. I landed my dream program thanks to this platform.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&auto=format&fit=crop',
    },
    {
        name: 'Sarah L.',
        role: 'Fulbright Scholar',
        quote: 'The deadline reminders saved me from missing a key scholarship. The document review service is gold.',
        image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
    },
];

// --- Small helper: Testimonial Card ---
interface TestimonialCardProps {
    testimonial: {
        name: string;
        role: string;
        quote: string;
        image: string;
    };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => (
    <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 card-hover">
        <div className="flex items-center mb-6">
            <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-primary"
            />
            <div>
                <h4 className="font-bold text-lg text-secondary">{testimonial.name}</h4>
                <p className="text-sm text-neutral-dark">{testimonial.role}</p>
            </div>
        </div>
        <p className="italic text-neutral-dark">"{testimonial.quote}"</p>
    </motion.div>
);

export default function AboutPage() {
    const { currentUser } = useAuth();

    return (
        <div className="bg-neutral-100 min-h-screen font-sans text-neutral-dark">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-[60vh] flex items-center justify-center text-center py-20">
                <div className="absolute inset-0 section-gradient z-0"></div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-4xl px-4 z-10"
                >
                    <h1 className="text-gradient font-extrabold mb-4">
                        Beyond the Application: Our Story.
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 text-neutral-dark mt-6">
                        We believe every dream deserves a clear path. Grad Manager was born from the chaos of our own application journeys, so you don't have to navigate yours alone.
                    </p>
                </motion.div>
            </section>

            {/* From Chaos to Clarity */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                    <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <h2 className="text-3xl font-bold text-gradient mb-4">From Chaos to Clarity</h2>
                        <p className="text-neutral-dark leading-relaxed mb-4">
                            The path to grad school is often a maze of scattered information, daunting deadlines, and the pressure to stand out. We lived that reality and knew there had to be a more intelligent way. We envisioned a world where students could spend less time on logistics and more time on their actual applications.
                        </p>
                        <p className="text-neutral-dark leading-relaxed">
                            This vision led to Grad Manager, a single, powerful platform built to cut through the noise. We designed it to be your personal command center, bringing every critical piece of your application journey into sharp focus, from finding the right program to celebrating your acceptance letter.
                        </p>
                    </motion.div>
                    <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3" alt="Students collaborating" className="rounded-2xl shadow-lg card-hover" />
                    </motion.div>
                </div>
            </section>

            {/* Our Guiding Principles */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-50 via-white to-blue-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-12">Our Guiding Principles</h2>
                    <p className="max-w-3xl mx-auto text-lg mb-10 text-neutral-dark">
                        These core values are not just words, they are the foundation of everything we build. They guide our decisions and ensure that we remain dedicated to your success, today and in the future.
                    </p>
                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
                        {coreValues.map((value, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-white p-8 rounded-xl shadow-md card-hover"
                            >
                                <div className="flex justify-center mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold text-secondary mb-2">{value.title}</h3>
                                <p className="text-neutral-dark leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* By the Numbers: Our Impact */}
            <section className="relative py-20 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 animate-gradient-flow opacity-90"></div>
                <div className="relative z-10 max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
                    {impactStats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}
                        >
                            <div className="text-5xl font-bold drop-shadow-lg flex items-center justify-center">
                                {stat.icon}
                                <CountUp end={stat.stat} suffix={stat.suffix} className="ml-2" />
                            </div>
                            <div className="opacity-90 mt-2">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* What Our Students Say */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-pink-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-12">What Our Students Say</h2>
                    <p className="max-w-3xl mx-auto text-lg mb-10 text-neutral-dark">
                        Don't just take our word for it. These stories from students around the world prove that with the right tools, anything is possible.
                    </p>
                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <TestimonialCard key={i} testimonial={testimonial} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* The People Behind the Passion */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-indigo-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-12">The People Behind the Passion</h2>
                    <p className="max-w-3xl mx-auto text-lg mb-10 text-neutral-dark">
                        Our team is a blend of academic experts, passionate mentors, and brilliant engineers who are all united by a single goal: to empower the next generation of global leaders.
                    </p>
                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-10">
                        {teamMembers.map((member, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-white p-8 rounded-2xl shadow-lg card-hover"
                            >
                                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-md" />
                                <h3 className="text-xl font-semibold text-secondary mt-6">{member.name}</h3>
                                <p className="text-primary mt-1 mb-4">{member.title}</p>
                                <p className="text-neutral-dark text-sm leading-relaxed">{member.bio}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            {!currentUser && (
                <section className="relative overflow-hidden py-16">
                    <div className="absolute inset-0 section-gradient z-0"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/50">
                            <h3 className="text-3xl font-bold text-gradient">Your Journey Starts Here.</h3>
                            <p className="max-w-2xl mx-auto mt-3 text-neutral-dark">
                                Join thousands of students who are turning their academic aspirations into reality. Your future is waiting.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Link to="/signup">
                                    <motion.button {...floatBtn} className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow hover:opacity-95 transition">
                                        Create free account
                                    </motion.button>
                                </Link>
                                <Link to="/contact" className="underline text-primary">Contact us</Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
