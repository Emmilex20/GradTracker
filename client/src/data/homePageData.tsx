// src/data/homePageData.ts

import type { ReactNode } from 'react';
import {
    FaGraduationCap,
    FaSearchDollar,
    FaCalendarAlt,
    FaUserFriends,
    FaFileAlt,
    FaPenNib,
    FaUsers,
} from 'react-icons/fa';

// Import local images for platform features
import scholarshipImage from '../assets/images/scholarship_resized.png';
import scholarshipImage2 from '../assets/images/scholarship.jpg';
import calendarImage from '../assets/images/calendar.jpg';
import calendarImage2 from '../assets/images/calendar2.jpg';
import documentImage from '../assets/images/document.jpg';
import documentImage2 from '../assets/images/document2.jpg';
import SOP from '../assets/images/SOP.jpg';
import SOP2 from '../assets/images/SOP2.jpg';
import Project from '../assets/images/Project.jpg';
import Project2 from '../assets/images/Project2.png';
import mentorImage from '../assets/images/mentor.webp';
import blogImage from '../assets/images/blog.webp';
import connectImage from '../assets/images/connect.png';

// --- Type definitions ---
export interface Scholarship {
    name: string;
    location: string;
    level: string;
    funding: string;
    deadline: string;
    blurb: string;
    image: string;
}

export interface Testimonial {
    name: string;
    role: string;
    quote: string;
    image: string;
}

export interface BlogPost {
    title: string;
    date: string;
    blurb: string;
    image: string;
    link: string;
}

export interface Feature {
    icon: ReactNode;
    title: string;
    desc: string;
    src: string;
    fullDesc: string; 
    fullImage: string;
}

export interface Step {
    icon: ReactNode;
    title: string;
    desc: string;
    img: string;
}

// --- Data for the home page sections ---
export const platformFeatures: Feature[] = [
    {
        icon: <FaSearchDollar className="text-2xl" />, 
        src: scholarshipImage, 
        title: 'Search for Graduate Program', 
        desc: "Find schools faster. Filter by program, funding, waiver (app fee, GRE, IELTS..) - no more  endless searching.",
        fullDesc: 'Our advanced search engine allows you to filter and discover thousands of graduate programs with funding. You can search by degree level, subject, location, and even specific research interests. We provide verified information on funding availability, application fees, and key requirements, helping you save time and focus on the best-fit opportunities. The platform also gives you a personalized dashboard to track and manage your potential programs.',
        fullImage: scholarshipImage2,
    },
    { 
        icon: <FaCalendarAlt className="text-2xl" />, 
        src: calendarImage, 
        title: 'Application Progress Tracking', 
        desc: "See all your applications at a glance. Track from 'Interested' to 'Accepted' without losing count.",
        fullDesc: 'The GradManager dashboard is your central hub for all applications. It features a customisable kanban board and a calendar view, allowing you to track each program from "Researching" to "Accepted." You can upload documents, add notes, set reminders, and manage your to-do lists all in one place, ensuring you never miss a critical step.',
        fullImage: calendarImage2,
    },
    { 
        icon: <FaPenNib className="text-2xl" />, 
        src: SOP, 
        title: 'SOP and CV Live Writing', 
        desc: "Struggling with your first draft? Get paired with a mentor who will co-write your SOP and CV from scratch with you over Zoom, guiding you step by step.",
        fullDesc: 'Feeling overwhelmed staring at a blank page? You’re not alone—most students struggle to put their dreams into words. That’s where we come in. In a live Zoom session, you’ll work one-on-one with an expert mentor who understands the pressure you’re under. Together, we’ll turn your raw ideas into a polished SOP and CV that capture your true potential. No more second-guessing or rejection fears—just powerful, professional documents that open doors and give you the confidence to chase your future.',
        fullImage: SOP2,
    },
    { 
        icon: <FaFileAlt className="text-2xl" />, 
        src: documentImage, 
        title: 'Document Reviews and Storage', 
        desc: "Finished your draft? Get a mentor's detailed review with line-by-line edits, clarity checks, and final polish so you apply with confidence. Plus, store your SOPs and CVs safely online - no more lost files if your computer crashes.",
        fullDesc: 'Never worry about losing your important files again. With this app, you can securely upload and store documents like SOPs, CVs, and more, ready for access anytime you need them. Plus, you can request expert scholar reviews to refine and improve your documents for the best results.',
        fullImage: documentImage2,
    },
    { 
        icon: <FaUsers className="text-2xl" />, 
        src: Project2, 
        title: 'Join Ongoing Projects', 
        desc: "Worried your CV is not strong enough? Collaborate on real projects with peers to boost your portfolio (e.g write review papers for publications, build a model, do research e.t.c).",
        fullDesc: "Worried your CV isn’t enough? Stand out by collaborating on real projects with driven peers—whether it’s writing impactful review papers, building innovative models, or contributing to research that gets noticed. Not only will you strengthen your portfolio, but you’ll also gain the kind of hands-on experience and credibility that admissions committees and employers truly value.",
        fullImage: Project,
    },
    { 
        icon: <FaUserFriends className="text-2xl" />, 
        src: mentorImage, 
        title: 'Find a Mentor and Alumni', 
        desc: 'This allows you to find a scholarship mentor and/or alumni of a specific scholarship or specific school.',
        fullDesc: 'Once you get that interview invitation, GradManager offers comprehensive resources to help you prepare. Practice with mock interviews, get feedback on your responses, and learn the common questions and strategies for your specific program. Our mentors will help you build the confidence and skills needed to impress the admissions committee.',
        fullImage: mentorImage,
    },
    { 
        icon: <FaGraduationCap className="text-2xl" />, 
        src: blogImage, 
        title: 'Application Resources and Blog', 
        desc: 'You will find curated and organized content and videos to help you along the process, from how to craft award-winning SOPs to approaching your referees, e.t.c.',
        fullDesc: 'We have a library of resources to help you with every stage of the application process. From sample essays to video tutorials on approaching referees, our blog and resource center is designed to provide you with the tools and knowledge you need to succeed. Our content is curated by scholarship winners and admissions professionals.',
        fullImage: blogImage,
    },
    { 
        icon: <FaUserFriends className="text-2xl" />, 
        src: connectImage, 
        title: 'Connect With Other Applicants', 
        desc: 'You get to find other applicants, form accountability partner and navigate grad school process together. There is also a community page to connect at large. Offline meetup is also a possibility',
        fullDesc: 'The journey to graduate school is easier with a community. Our platform allows you to connect with other applicants from similar backgrounds and interests. You can form accountability partnerships, share tips, and support each other. We also host a community page for broader discussions and even facilitate offline meetups for local members.',
        fullImage: connectImage,
    },
];

export const featuredScholarships: Scholarship[] = [
    {
        name: 'Rice University',
        location: 'United States',
        level: 'Masters',
        funding: 'Full Scholarship',
        deadline: '2025-12-01',
        blurb: 'Full tuition + stipend for outstanding international students in STEM & Social Sciences. Covers travel and living allowance.',
        image: 'https://questbridge.imgix.net/content/uploads/partners/rice-university/University_Lockups_Print_Rice_Blue-1.png?auto=compress%2Cformat&fit=clip&h=384&q=90&s=f18020c84f8ca5a4777f9ddd296519cc',
    },
    {
        name: 'Massachusetts Institute of Technology (MIT)',
        location: 'USA (virtual + campus)',
        level: 'Masters & PhD',
        funding: 'Tuition + Stipend',
        deadline: '2025-12-01',
        blurb: 'Supporting researchers and practitioners from Africa with funding, mentorship and placement opportunities.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdM5ksmAFMHhM9XaNNnqDfxCFxFb3LfBXLjA&s',
    },
    {
        name: 'University of California, Berkeley',
        location: 'California',
        level: 'MBA',
        funding: 'Partial Scholarships',
        deadline: '2025-12-01',
        blurb: 'Merit-based partial scholarships and waived application fee for select MBA applicants.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg',
    },
];

export const testimonials = [
    {
        name: 'Amina Yusuf',
        role: 'Fulbright Scholar 2024',
        quote: 'Grad Manager turned hours of research into one dashboard. I found funded programs and connected with a mentor who reviewed my SOP — I got in! ',
        image: 'https://media.istockphoto.com/id/1053900704/photo/portrait-of-female-high-school-student-wearing-uniform-working-at-laptop-in-library.jpg?s=612x612&w=0&k=20&c=mU_6CHuXrvJBqK5It4XjcHEGiyo3b2VPmf2Pq2mw2EI=',
    },
    {
        name: 'Daniel Okoye',
        role: 'Masters — Greenfield University',
        quote: 'The deadline reminders saved me from missing a key scholarship. The document review service is gold.',
        image: 'https://media.istockphoto.com/id/1785382011/photo/campus-student-and-portrait-of-black-man-at-college-building-academy-and-school-for-education.jpg?s=612x612&w=0&k=20&c=BDhGY9HWCie8f22RASEIGBGaTMozUu9Zxm1o-X-tXFg=',
    },
];

export const steps: Step[] = [
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

export const blogPosts = [
    {
        title: 'How to Write a Winning Statement of Purpose',
        date: 'Aug 1, 2025',
        image: 'https://blog.scholarden.com/wp-content/uploads/2022/01/Time-Management-on-the-GRE-1680-%C3%97-945-px-14-1536x864-1-1024x576.webp',
        blurb: 'Your SOP is your story. Learn to craft a compelling narrative that stands out to admissions committees and secures your spot.',
        link: '/blog/sop-guide',
    },
    {
        title: 'The Ultimate Guide to Getting a Reference Letter',
        date: 'Jul 25, 2025',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4M1XO1Ee4sH3gE5AqbKdbSMuje373qbUOfTMVLVimCIGCiDbPlMx4dwXhscsj7XAr3E&usqp=CAU',
        blurb: 'A great reference letter can make all the difference. Find out how to approach professors and secure the best recommendations.',
        link: '/blog/reference-letter-guide',
    },
    {
        title: 'Navigating Application Fee Waivers and Deadlines',
        date: 'Jul 18, 2025',
        image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
        blurb: 'Don’t let fees and deadlines stop you. We’ve compiled a list of schools that offer waivers and tips to keep your applications on track.',
        link: '/blog/fee-waivers-guide',
    },
];