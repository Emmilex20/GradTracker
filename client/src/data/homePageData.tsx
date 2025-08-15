// src/data/homePageData.ts

import type { ReactNode } from 'react';
import {
    FaGraduationCap,
    FaSearchDollar,
    FaCalendarAlt,
    FaUserFriends,
    FaFileAlt,
} from 'react-icons/fa';

// Import local images for platform features
import scholarshipImage from '../assets/images/scholarship_resized.png';
import scholarshipImage2 from '../assets/images/scholarship.jpg';
import calendarImage from '../assets/images/calendar.jpg';
import calendarImage2 from '../assets/images/calendar2.jpg';
import documentImage from '../assets/images/document.jpg';
import documentImage2 from '../assets/images/document2.jpg';
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
        title: 'Program Search with Details', 
        desc: `Allows you to type in your course and school (e.g., Chemistry, Harvard University) and instantly see:
- Graduate funding opportunities
- GRE, IELTS, and application fee waiver status
- Required documents for your application.`,
        fullDesc: 'Our advanced search engine allows you to filter and discover thousands of graduate programs with funding. You can search by degree level, subject, location, and even specific research interests. We provide verified information on funding availability, application fees, and key requirements, helping you save time and focus on the best-fit opportunities. The platform also gives you a personalized dashboard to track and manage your potential programs.',
        fullImage: scholarshipImage2,
    },
    { 
        icon: <FaCalendarAlt className="text-2xl" />, 
        src: calendarImage, 
        title: 'Application Tracker', 
        desc: "Allows you to add programs to your dashboard. Track those you have applied to, and those in progress. You can also track professors you've contacted and those you haven't.",
        fullDesc: 'The GradManager dashboard is your central hub for all applications. It features a customisable kanban board and a calendar view, allowing you to track each program from "Researching" to "Accepted." You can upload documents, add notes, set reminders, and manage your to-do lists all in one place, ensuring you never miss a critical step.',
        fullImage: calendarImage2,
    },
    { 
        icon: <FaFileAlt className="text-2xl" />, 
        src: documentImage, 
        title: 'Document Storage and Reviews', 
        desc: "Store and access your important documents (SOPs, CVs, recommendation letters, etc.) anytime. No worries about losing files, and you can request expert document reviews directly through the app.",
        fullDesc: 'Never worry about losing your important files again. With this app, you can securely upload and store documents like SOPs, CVs, and more, ready for access anytime you need them. Plus, you can request expert scholar reviews to refine and improve your documents for the best results.',
        fullImage: documentImage2,
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

export const testimonials = [
    {
        name: 'Amina Yusuf',
        role: 'Fulbright Scholar 2024',
        quote: 'Grad Manager turned hours of research into one dashboard. I found funded programs and connected with a mentor who reviewed my SOP — I got in! ',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&auto=format&fit=crop',
    },
    {
        name: 'Daniel Okoye',
        role: 'Masters — Greenfield University',
        quote: 'The deadline reminders saved me from missing a key scholarship. The document review service is gold.',
        image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
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