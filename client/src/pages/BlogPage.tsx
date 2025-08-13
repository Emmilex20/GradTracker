import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaTimes } from 'react-icons/fa';

// Define the type for a blog post object
interface BlogPost {
    title: string;
    date: string;
    image: string;
    blurb: string;
    fullContent: string; // New property for the full article content
}

// --- Animation variants ---
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

// Blog post data with detailed content
const blogPosts: BlogPost[] = [
    {
        title: 'How to Write a Winning Statement of Purpose',
        date: 'Aug 1, 2025',
        image: 'https://blog.scholarden.com/wp-content/uploads/2022/01/Time-Management-on-the-GRE-1680-%C3%97-945-px-14-1536x864-1-1024x576.webp',
        blurb: 'Your SOP is your story. Learn to craft a compelling narrative that stands out to admissions committees and secures your spot.',
        fullContent: `Your Statement of Purpose (SOP) is one of the most critical components of your application. It’s your opportunity to tell your story, share your motivations, and convince the admissions committee that you are the perfect fit for their program.

        A winning SOP is not just a list of your accomplishments. It’s a narrative that connects your past experiences—academic, professional, and personal—to your future goals. Start with a captivating opening that grabs the reader’s attention, and then build a compelling argument for why you are a strong candidate.

        Focus on detailing your research interests, explaining why you're interested in this specific program, and mentioning any faculty members you hope to work with. Conclude with a powerful summary that reiterates your passion and commitment. A well-crafted SOP can make all the difference.`,
    },
    {
        title: 'The Ultimate Guide to Getting a Reference Letter',
        date: 'Jul 25, 2025',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4M1XO1Ee4sH3gE5AqbKdbSMuje373qbUOfTMVLVimCIGCiDbPlMx4dwXhscsj7XAr3E&usqp=CAU',
        blurb: 'A great reference letter can make all the difference. Find out how to approach professors and secure the best recommendations.',
        fullContent: `A strong reference letter can significantly boost your application. The key is to ask the right person at the right time. Start by identifying professors or employers who know you well and can speak to your strengths, skills, and potential.

        It's crucial to give your recommenders plenty of time—at least a month—to write the letter. Provide them with a "recommender packet" that includes your CV, personal statement, and a list of the programs you're applying to with their deadlines. This makes their job easier and ensures they can write a detailed and personalized letter.

        Always follow up with a thank-you note, whether the outcome is a letter or not. Building and maintaining these professional relationships is a valuable part of your academic journey.`,
    },
    {
        title: 'Navigating Application Fee Waivers and Deadlines',
        date: 'Jul 18, 2025',
        image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
        blurb: 'Don’t let fees and deadlines stop you. We’ve compiled a list of schools that offer waivers and tips to keep your applications on track.',
        fullContent: `Application fees can be a significant barrier for many students. Fortunately, many universities offer fee waivers based on financial need, participation in certain programs, or other criteria.

        Begin your search early to identify schools that offer these waivers. Many graduate programs have specific forms or processes for requesting a waiver. It's often as simple as emailing the admissions office or filling out a form on the program's website.

        Staying on top of deadlines is equally important. Create a master spreadsheet with all your program deadlines, required materials, and contact information. This will help you stay organized and ensure you submit everything on time.`,
    },
    {
        title: 'Crafting the Perfect Academic CV for Graduate School',
        date: 'Jul 10, 2025',
        image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80&auto=format&fit=crop',
        blurb: 'An academic CV is different from a professional resume. Learn the key elements and what to include to highlight your research and publications.',
        fullContent: `An academic CV is a comprehensive document that highlights your scholarly achievements, not just your professional work history. While a resume is typically one page, a CV can be much longer, detailing your research, publications, presentations, and teaching experience.

        Key sections to include are: Education, Research Experience, Publications, Conference Presentations, Awards and Honors, and Teaching Experience. Unlike a resume, you should list everything in chronological order, with the most recent items first.

        Highlight your specific contributions to research projects and quantify your accomplishments whenever possible. A well-organized and detailed CV demonstrates your commitment to a career in academia.`,
    },
    {
        title: 'Finding Your Graduate School Mentor',
        date: 'Jul 3, 2025',
        image: 'https://images.squarespace-cdn.com/content/v1/5f8ef4dc9476572b4d6c99cd/84529f71-8524-40b4-984e-6b5b79d876d4/header+mentoring+101.png',
        blurb: 'A good mentor can be the key to your success. Discover strategies for identifying and reaching out to potential mentors in your field.',
        fullContent: `A strong mentor-mentee relationship is invaluable in graduate school. A mentor can guide your research, provide career advice, and connect you with key figures in your field.

        To find a mentor, start by researching faculty members whose work aligns with your interests. Read their publications, attend their seminars, and reach out to them to express your interest. A good initial email should be brief and respectful, mentioning a specific aspect of their work that you find compelling.

        Remember, a mentor doesn't have to be a faculty member. They can be a senior student, a postdoctoral researcher, or a professional in your industry. The goal is to find someone who can offer guidance and support throughout your journey.`,
    },
    {
        title: 'The Power of Cold Emails to Professors',
        date: 'Jun 28, 2025',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
        blurb: 'Learn how to write a compelling cold email to a professor to discuss research opportunities or potential supervision.',
        fullContent: `A well-written cold email can open doors to research opportunities and potential supervision. The key is to be concise, professional, and targeted.

        Start with a clear subject line that immediately communicates your purpose, such as "Prospective Graduate Student Inquiry: [Your Name]". In the body, introduce yourself, state your academic background, and explain why you are interested in their work. Be specific! Mention a particular paper or project of theirs that you admire.

        End the email with a clear call to action, such as asking for a brief meeting or if they are accepting new students. Attach your CV and a transcript to make it easy for them to review your qualifications.`,
    },
    {
        title: 'How to Prepare for a Graduate School Interview',
        date: 'Aug 8, 2025',
        image: 'https://making-waves.org/wp-content/uploads/2023/04/making-waves-job-internship-interview-tips-1.png',
        blurb: 'Interviews are a critical part of the process. We break down common questions and strategies to help you ace your interview.',
        fullContent: `The graduate school interview is your chance to shine and show the admissions committee your passion, knowledge, and personality. Preparation is key to a successful interview.

        Start by researching the program and the faculty members you'll be meeting. Be prepared to discuss your past research, your future goals, and why you are interested in their specific program. You should also prepare a few questions to ask them, as this shows genuine interest.

        Practice your answers to common questions like "Tell me about yourself" and "Why this program?" Remember to be confident and enthusiastic. Your passion for the subject can be as important as your academic record.`,
    },
    {
        title: 'Choosing the Right Program for Your Career Goals',
        date: 'Aug 15, 2025',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6okOEM7jcnnK3E9GbP6trlRXxdZkTPDa0BQ&s',
        blurb: 'With so many options, choosing a program can be tough. Our guide helps you align your academic interests with your long-term career aspirations.',
        fullContent: `Selecting a graduate program is a major decision. It’s not just about the program's reputation; it’s about finding the right fit for your academic interests and career aspirations.

        Consider the program's curriculum, faculty, research opportunities, and resources. Does the program offer courses that align with your passions? Are there faculty members whose work excites you? Will the degree prepare you for the career path you envision?

        Don't hesitate to reach out to current students and alumni. Their insights can provide a more realistic picture of the program's strengths and weaknesses, helping you make an informed decision.`,
    },
    {
        title: 'Mastering the Art of Networking in Academia',
        date: 'Aug 22, 2025',
        image: 'https://media.licdn.com/dms/image/v2/D4E12AQHTzisRUekK7g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1721169482262?e=2147483647&v=beta&t=Bh7M3MpvGJ9Y3K2bryge2lmTiPf_sNDbjwSu5avOGew',
        blurb: 'Building connections is essential. Learn how to network effectively at conferences, seminars, and on social media to build your professional circle.',
        fullContent: `Networking is not just for the corporate world; it's a vital skill in academia. Building a strong professional network can lead to research collaborations, job opportunities, and lifelong friendships.

        Start by attending conferences, seminars, and workshops in your field. Don't be afraid to introduce yourself to speakers and other attendees. A simple, "I really enjoyed your talk on X; I'm a student interested in Y," can start a valuable conversation.

        Online platforms like LinkedIn and Twitter can also be powerful networking tools. Follow influential scholars and labs, engage with their posts, and share your own work. This helps you stay informed and visible within your academic community.`,
    },
];

export default function BlogPage() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const openModal = (post: BlogPost) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
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
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-900">GradTrack Blog</h1>
                    <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-700">
                        Your go-to resource for tips, guides, and inspiration on your graduate school application journey.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-6 py-14">
                <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" 
                    variants={container} 
                    initial="hidden" 
                    animate="show"
                >
                    {blogPosts.map((post, i) => (
                        <motion.div 
                            key={i} 
                            variants={item} 
                            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <div className="text-sm text-neutral-dark">{post.date}</div>
                                <h4 className="font-bold text-xl mt-2 text-secondary">{post.title}</h4>
                                <p className="mt-2 text-neutral-dark text-sm h-14 overflow-hidden">{post.blurb}</p>
                                <div className="mt-4">
                                    <div 
                                        onClick={() => openModal(post)} 
                                        className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                        Read more <FaBolt />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Modal for Full Blog Post Content */}
            <AnimatePresence>
                {selectedPost && (
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
                            className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-neutral-dark hover:text-secondary transition z-10"
                            >
                                <FaTimes size={24} />
                            </button>
                            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-72 object-cover rounded-t-3xl" />
                            <div className="p-8">
                                <h2 className="text-3xl font-bold text-secondary">{selectedPost.title}</h2>
                                <p className="text-sm text-neutral-dark mt-2">{selectedPost.date}</p>
                                <p className="mt-6 text-neutral-dark text-lg leading-relaxed whitespace-pre-wrap">{selectedPost.fullContent}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}