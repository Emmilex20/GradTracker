import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaGraduationCap,
    FaSearchDollar,
    FaCalendarAlt,
    FaUserFriends,
    FaFileAlt,
    FaShieldAlt,
    FaCheckCircle,
    FaBolt,
    FaStar,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Import local images
import scholarshipImage from '../assets/images/scholarship_resized.png';
import calendarImage from '../assets/images/calendar.jpg';
import documentImage from '../assets/images/document.jpg';
import mentorImage from '../assets/images/mentor.jpg';
import blogImage from '../assets/images/blog.webp';
import connectImage from '../assets/images/connect.png';

// Define the type for a scholarship object
interface Scholarship {
    name: string;
    location: string;
    level: string;
    funding: string;
    deadline: string;
    blurb: string;
    image: string;
}

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
            {/* Pulsating Gradient Background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-xl animate-pulse-slow"
            ></motion.div>

            {/* Central Icon */}
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
        </div>
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
                <Link to="/apply" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-95">Apply</Link>
            </div>
        </div>
    </motion.div>
);

export default function HomePage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a network request
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // 2-second delay

        return () => clearTimeout(timer);
    }, []);

    const featuredScholarships: Scholarship[] = [
        {
            name: 'Global Masters Scholarship — Greenfield University',
            location: 'United Kingdom',
            level: 'Masters',
            funding: 'Full Scholarship',
            deadline: 'Dec 15, 2025',
            blurb: 'Full tuition + stipend for outstanding international students in STEM & Social Sciences. Covers travel and living allowance.',
            image: 'https://www.lps.upenn.edu/sites/default/files/2020-10/news-graduation-2019-final2.png',
        },
        {
            name: 'Africa Fellowship for Development',
            location: 'USA (virtual + campus)',
            level: 'Masters & PhD',
            funding: 'Tuition + Stipend',
            deadline: 'Jan 20, 2026',
            blurb: 'Supporting researchers and practitioners from Africa with funding, mentorship and placement opportunities.',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop',
        },
        {
            name: 'No-Fee International MBA Grants',
            location: 'Canada',
            level: 'MBA',
            funding: 'Partial Scholarships',
            deadline: 'Nov 30, 2025',
            blurb: 'Merit-based partial scholarships and waived application fee for select MBA applicants.',
            image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80&auto=format&fit=crop',
        },
    ];

    const testimonials = [
        {
            name: 'Amina Yusuf',
            role: 'Fulbright Scholar 2024',
            quote: 'Grad Tracker turned hours of research into one dashboard. I found funded programs and connected with a mentor who reviewed my SOP — I got in! ',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&auto=format&fit=crop',
        },
        {
            name: 'Daniel Okoye',
            role: 'Masters — Greenfield University',
            quote: 'The deadline reminders saved me from missing a key scholarship. The document review service is gold.',
            image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
        },
    ];

    const steps = [
        {
            title: 'Search & Discover',
            desc: 'Filter programs by funding type, country, field, and application fee to find matches in seconds.',
            icon: <FaSearchDollar className="text-4xl" />,
            img: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1000&q=80&auto=format&fit=crop',
        },
        {
            title: 'Track Applications',
            desc: 'One place for deadlines, required docs, statuses and notes. Share progress with mentors.',
            icon: <FaCalendarAlt className="text-4xl" />,
            img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1000&q=80&auto=format&fit=crop',
        },
        {
            title: 'Get Reviews & Mentorship',
            desc: 'Submit essays, CVs, and documents for mentor feedback and iterate until it shines.',
            icon: <FaUserFriends className="text-4xl" />,
            img: 'https://images.unsplash.com/photo-1544717305-996b815c338c?w=1000&q=80&auto=format&fit=crop',
        },
        {
            title: 'Celebrate Offers',
            desc: 'Track your acceptances and next steps — celebrate milestones and plan your next move.',
            icon: <FaGraduationCap className="text-4xl" />,
            img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=80&auto=format&fit=crop',
        },
    ];

    const platformFeatures = [
        { icon: <FaSearchDollar className="text-2xl" />, src: scholarshipImage, title: 'Program search with details', desc: 'It allows you to search for a specific course and School (e.g Chemistry, Harvard University) and when you do, it shows funding, waivers (GRE, IELTS, Application fees) and application documents.' },
        { icon: <FaCalendarAlt className="text-2xl" />, src: calendarImage, title: 'Application Tracker', desc: 'Allows you to add programs to your dashboard. Track those you have applied to, and those in progress. Also Professors you have emailed and those you have not.' },
        { icon: <FaFileAlt className="text-2xl" />, src: documentImage, title: 'Document Reviews', desc: "Get your SOP's essays, academic CVs, and cold email reviewed." },
        { icon: <FaUserFriends className="text-2xl" />, src: mentorImage, title: 'Find a Mentor and Alumni', desc: 'This allows you to find a scholarship mentor and/or alumni of a specific scholarship or specific school.' },
        { icon: <FaUserFriends className="text-2xl" />, src: blogImage, title: 'Application Resources and Blog', desc: 'You will find curated and organized content and videos to help you along the process, from how to craft award-winning SOPs to approaching your referees, e.t.c.' },
        { icon: <FaUserFriends className="text-2xl" />, src: connectImage, title: 'Connect With Other Applicants', desc: 'You get to find other applicants, form accountabilty partner and navigate grad school process together. There is also a community page to connect at large. Offline meetup is also a possibility' },
    ];
    
    const blogPosts = [
        {
            title: 'How to Write a Winning Statement of Purpose',
            date: 'Aug 1, 2025',
            image: 'https://blog.scholarden.com/wp-content/uploads/2022/01/Time-Management-on-the-GRE-1680-%C3%97-945-px-14-1536x864-1-1024x576.webp',
            blurb: 'Your SOP is your story. Learn to craft a compelling narrative that stands out to admissions committees and secures your spot.',
        },
        {
            title: 'The Ultimate Guide to Getting a Reference Letter',
            date: 'Jul 25, 2025',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4M1XO1Ee4sH3gE5AqbKdbSMuje373qbUOfTMVLVimCIGCiDbPlMx4dwXhscsj7XAr3E&usqp=CAU',
            blurb: 'A great reference letter can make all the difference. Find out how to approach professors and secure the best recommendations.',
        },
        {
            title: 'Navigating Application Fee Waivers and Deadlines',
            date: 'Jul 18, 2025',
            image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
            blurb: 'Don’t let fees and deadlines stop you. We’ve compiled a list of schools that offer waivers and tips to keep your applications on track.',
        },
    ];

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
                            <Link to="/mentors">
                                <button className="bg-white text-primary px-6 py-3 rounded-full shadow-md border border-primary font-semibold">Talk to Mentor</button>
                            </Link>
                        </motion.div>
                        <motion.div {...floatBtn} className="rounded-full overflow-hidden">
                            <Link to="/programs">
                                <button className="bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-3 rounded-full shadow-md font-semibold">Search Now</button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* HERO (light premium gradient + frosted card + floating shapes) */}
                    <motion.section
                        initial="hidden"
                        animate="show"
                        variants={container}
                        className="relative overflow-hidden py-20 sm:py-28"
                    >
                        {/* Pale gradient background for hero */}
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

                        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-10">
                            <motion.div variants={item} className="flex-1 text-center lg:text-left">
                                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-blue-900">
                                    Grad School Application Can Be Overwhelming!
                                </h1>
                                <p className="mt-5 text-lg text-gray-700 max-w-2xl">
                                    From program search to writing tons of SOPs/CVs unto managing cold emails, reference letters, waivers, and deadlines - It is a full time job.
                                </p>
                                <p className="mt-5 text-lg text-gray-700 max-w-2xl">
                                    This is why we built GradTrack - A personalised WebApp that makes the process less overwhelming. It allows you to manage the entire process with a single dashboard.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center lg:justify-start">
                                    {!currentUser ? (
                                        <>
                                            <Link to="/signup">
                                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="px-7 py-4 rounded-full bg-blue-600 text-white font-bold shadow-2xl flex items-center gap-3">
                                                    <FaGraduationCap /> Join Us Now
                                                </motion.button>
                                            </Link>
                                            <Link to="/features">
                                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="px-6 py-4 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition">
                                                    Explore Features
                                                </motion.button>
                                            </Link>
                                        </>
                                    ) : (
                                        <Link to="/dashboard">
                                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="px-8 py-4 rounded-full bg-white text-blue-700 font-bold shadow-2xl">Go to Dashboard</motion.button>
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-4 items-center text-sm text-gray-700">
                                    <div className="flex items-center gap-3"><FaBolt /><span>Curated funded programs</span></div>
                                    <div className="flex items-center gap-3"><FaShieldAlt /><span>Verified application info</span></div>
                                    <div className="flex items-center gap-3"><FaCheckCircle /><span>Mentors & document reviews</span></div>
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="flex-1 relative">
                                {/* The animated image with a smooth bounce */}
                                <motion.img
                                    src="https://img.freepik.com/premium-photo/handsome-young-latin-american-man-smart-student-watching-webinar-online-class-using-laptop_695242-1819.jpg?semt=ais_hybrid&w=740&q=80"
                                    alt="Bouncing animated dashboard"
                                    className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                                    animate={{ y: ["0%", "-5%", "0%"] }} // Bounces the image up and down
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

                    {/* What GradTrack Offers (Updated to include local images) */}
                    <section className="container mx-auto px-6 py-14">
    <motion.h2
        className="text-3xl md:text-4xl font-bold text-center text-secondary"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
    >
        What GradTrack Offers.
    </motion.h2>
    <motion.p className="max-w-3xl mx-auto text-center mt-3 text-neutral-dark">
        Everything from discovery to mentorship — built for applicants who want results and less stress.
    </motion.p>

    <motion.div
        className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
    >
        {platformFeatures.map((feat, i) => (
            <motion.div
                key={i}
                variants={item}
                className="relative p-8 bg-white rounded-2xl shadow-lg border border-transparent overflow-hidden
                           transform hover:scale-105 transition-all duration-300 group
                           hover:shadow-xl"
            >
                {/* Animated Border on Hover */}
                <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="rounded-full w-14 h-14 flex items-center justify-center bg-blue-100 text-primary mb-6">
                        {feat.icon}
                    </div>
                    {/* The fix is here: Added h-12 and flex items-start */}
                    <h4 className="font-bold text-lg text-secondary pb-16 h-12 flex items-start">{feat.title}</h4> 
                    <div className="rounded-lg w-full h-48 flex-grow-0 flex-shrink-0 flex items-center justify-center mb-4 overflow-hidden relative">
                        <img src={feat.src} alt={feat.title} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <p className="mt-auto text-sm text-neutral-dark flex-grow">{feat.desc}</p>
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
                            <h3 className="text-3xl font-bold text-secondary">See Grad Tracker in action</h3>
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
                            <h3 className="text-3xl font-bold text-secondary">GradTrack Blog</h3>
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
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-gradient bg-[length:400%_400%]"></div>

                        {/* Soft glowing animated orbs */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

                        {/* Content */}
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
                                <h4 className="font-semibold">Is Grad Tracker free?</h4>
                                <p className="mt-2 text-sm text-neutral-dark">Yes — core discovery and tracking features are free. Premium services such as in-depth review are paid.</p>
                            </div>
                        </div>
                    </section>

                    {/* FINAL CTA (light gradient + frosted card + floating shapes) */}
                    {!currentUser && (
                        <section className="relative overflow-hidden py-16">
                            {/* CTA background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-blue-100 z-0"></div>

                            {/* floating shapes */}
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}