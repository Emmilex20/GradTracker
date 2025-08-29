import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { FaKaaba, FaEnvelope, FaSearch, FaRegClock, FaChartBar, FaCloud, FaRocket } from 'react-icons/fa';

// Reusing the same animation variants as the HomePage
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// Updated data with professional icons and polished text
const features = [
    {
        title: "Visual Kanban Dashboard",
        description: "Organize your applications with a drag-and-drop kanban board. Easily track each application's status from 'Interested' to 'Submitted' and beyond. Visualize your progress at a glance.",
        icon: <FaKaaba />,
        image: "https://images.ctfassets.net/w6r2i5d8q73s/6wpAeUvjqESIFd6ayYpLcR/d19af2d0b32be76f1a8d64860e8fafbe/agile_kanban_product-image_EN_big_3_2.png",
    },
    {
        title: "Integrated Communication Hub",
        description: "Keep all your communication related to applications in one organized place. Log emails, notes from calls, and important contact information effortlessly.",
        icon: <FaEnvelope />,
        image: "https://img.freepik.com/free-vector/illustration-business-people_53876-58974.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
        title: "Automated Discovery",
        description: "Discover relevant graduate programs and scholarship opportunities tailored to your profile and interests. Our smart algorithms do the heavy lifting for you.",
        icon: <FaSearch />,
        image: "https://d3bkbkx82g74b8.cloudfront.net/eyJidWNrZXQiOiJsYWJyb290cy1pbWFnZXMiLCJrZXkiOiJzY2hvbGFyc2hpcF9wcm9maWxlX2ltYWdlXzNhZjQ3MGNiNWQ3ZjJhNDE1ODEwOWMzNmI4ODdmNzczNDI0OTNlNTNfMjUyMi5wbmciLCJlZGl0cyI6eyJ0b0Zvcm1hdCI6ImpwZyIsInJlc2l6ZSI6eyJ3aWR0aCI6OTAwLCJoZWlnaHQiOjQ1MCwiZml0IjoiY292ZXIiLCJwb3NpdGlvbiI6ImNlbnRlciIsImJhY2tncm91bmQiOiIjZmZmIn0sImZsYXR0ZW4iOnsiYmFja2dyb3VuZCI6IiNmZmYifX19",
    },
    {
        title: "Comprehensive Management",
        description: "Attach detailed notes, upload documents, and set reminders for every application. Our system ensures you never miss a crucial deadline or forget important details.",
        icon: <FaRegClock />,
        image: "https://www.shutterstock.com/image-photo/business-planning-calendar-agenda-work-600nw-2461973363.jpg",
    },
    {
        title: "Progress Visualization",
        description: "Track your overall progress with insightful charts and analytics. Understand where you stand with your applications and identify areas needing attention.",
        icon: <FaChartBar />,
        image: "https://pce.sandiego.edu/wp-content/uploads/2022/03/usd-pce-data-analytics-visualization.jpeg",
    },
    {
        title: "Secure Cloud Storage",
        description: "Your data and documents are securely stored in the cloud, accessible from any device, anytime. Focus on your applications, knowing your information is safe.",
        icon: <FaCloud />,
        image: "https://assets.esecurityplanet.com/uploads/2024/01/esp_20240117-how-secure-is-cloud-storage.png",
    },
];

const testimonials = [
    {
        quote: "Grad Manager was a game-changer for my application process. I've never felt more organized and in control. The kanban board is incredibly intuitive!",
        name: "Alex P.",
        school: "UCLA, Accepted PhD Program",
    },
    {
        quote: "I used to track everything in a messy spreadsheet. Grad Manager's centralized hub for notes and communications saved me countless hours.",
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
    { step: 1, title: "Create Your Account", description: "Sign up in minutes to create your personalized Grad Manager dashboard.", icon: <FaRocket /> },
    { step: 2, title: "Add Applications", description: "Easily add graduate programs and scholarships you are interested in. Fill in key details like deadlines and requirements.", icon: <FaRegClock /> },
    { step: 3, title: "Track Your Progress", description: "Use our visual kanban board to move applications through different stages. Add notes, documents, and reminders along the way.", icon: <FaKaaba /> },
    { step: 4, title: "Succeed & Celebrate!", description: "Stay on top of every deadline and requirement. When the acceptances roll in, you'll be ready to make an informed decision.", icon: <FaSearch /> },
];

export default function FeaturesPage() {
    const { currentUser } = useAuth();

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 z-0 animate-gradient-slow"></div>
                <div className="relative container mx-auto px-6 text-center text-blue-900">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
                    >
                        Unlock Your Graduate School Dreams with Grad Manager
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-6 text-lg max-w-3xl mx-auto text-neutral-dark"
                    >
                        Discover the features that will revolutionize your application process, keeping you organized, informed, and confident every step of the way.
                    </motion.p>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-12">
                        Explore Our Powerful Features
                    </h2>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition border border-neutral-200"
                            >
                                <div className="relative">
                                    <img src={feature.image} alt={feature.title} className="w-full h-56 object-cover" />
                                    <div className="absolute top-4 left-4 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div className="p-6 text-left">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-3">{feature.title}</h3>
                                    <p className="text-neutral-500">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-neutral-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-12">How It Works</h2>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {howItWorksSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
                            >
                                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-blue-900 mb-2">{step.title}</h3>
                                <p className="text-neutral-500">{step.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-12">
                        What Our Users Are Saying
                    </h2>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-neutral-100 p-8 rounded-2xl shadow-lg border-l-4 border-primary text-left"
                            >
                                <p className="text-lg text-neutral-600 italic mb-4">"{t.quote}"</p>
                                <div className="font-bold text-blue-900">{t.name}</div>
                                <div className="text-sm text-neutral-500">{t.school}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Community & Impact Counters */}
            <section className="relative py-16 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-white overflow-hidden">
                <div className="absolute inset-0 bg-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
                <div className="relative container mx-auto px-6 flex flex-wrap justify-center gap-12 text-center">
                    {[{ label: "Mentors", end: 300, suffix: "+" }, { label: "Students Helped", end: 2000, suffix: "+" }, { label: "Success Rate", end: 95, suffix: "%" }].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
                            <div className="text-4xl font-bold drop-shadow-lg"><CountUp end={stat.end} suffix={stat.suffix} duration={2.5} /></div>
                            <div className="opacity-90">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            {!currentUser && (
                <motion.section
                    className="relative overflow-hidden py-16"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={container}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-blue-100 z-0"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/50">
                            <h3 className="text-3xl font-bold text-blue-800 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                                Your journey to a graduate degree starts here.
                            </h3>
                            <p className="max-w-2xl mx-auto mt-3 text-gray-700">
                                Sign up for free and get personalized matches—plus one free document review when you create your profile.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Link to="/signup">
                                    <motion.button {...floatBtn} className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow hover:bg-blue-600 transition">
                                        Create free account
                                    </motion.button>
                                </Link>
                                <Link to="/contact" className="underline text-blue-700">Contact us</Link>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}
        </div>
    );
}