import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Reusing the same animation variants as the HomePage
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };


export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const { currentUser } = useAuth();

  const faq = [
    {
      question: "What are your business hours?",
      answer:
        "Our office is open Monday to Friday from 9:00 AM to 5:00 PM WAT.",
    },
    {
      question: "How long will it take to get a response?",
      answer: "We aim to respond to all inquiries within 24 business hours.",
    },
    {
      question: "Do you offer support on weekends?",
      answer:
        "While our regular business hours are Monday to Friday, we do monitor urgent requests occasionally on weekends.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    setTimeout(() => {
      console.log({ name, email, message });
      setStatus("Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  const renderCtaButton = () =>
    currentUser ? (
      <Link to="/dashboard">
        <motion.button {...floatBtn} className="bg-primary text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-blue-600 transition-all duration-300">
          Go to Dashboard
        </motion.button>
      </Link>
    ) : (
      <Link to="/signup">
        <motion.button {...floatBtn} className="bg-primary text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-blue-600 transition-all duration-300">
          Get Started for Free
        </motion.button>
      </Link>
    );

  return (
    <div className="bg-neutral-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center">
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
          className="relative z-10 max-w-3xl px-6 text-blue-900"
        >
          <h1 className="text-5xl font-bold mb-4">
            Contact Our Team in Lekki, Lagos
          </h1>
          <p className="text-lg opacity-90 text-neutral-dark">
            We're here to help you navigate your graduate school applications.
            Reach out with any questions or feedback.
          </p>
        </motion.div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <motion.div
          variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-blue-900">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2 text-neutral-dark">
                Name
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-neutral-dark">
                Email
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-neutral-dark">
                Message
              </label>
              <textarea
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-all"
            >
              {status || "Send Message"}
            </button>
          </form>
        </motion.div>

        {/* Info */}
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Our Office in Lekki</h3>
            <div className="space-y-4 text-neutral-dark">
              <div className="flex gap-3">
                <FaMapMarkerAlt className="text-primary mt-1" />
                <address className="not-italic">
                  12A, Adewale Kolawole Crescent,
                  <br />
                  Lekki Phase 1, Lagos State, Nigeria
                </address>
              </div>
              <div className="flex gap-3">
                <FaEnvelope className="text-primary mt-1" />
                <a
                  href="mailto:info.ng@yourdomain.com"
                  className="hover:underline"
                >
                  info.ng@yourdomain.com
                </a>
              </div>
              <div className="flex gap-3">
                <FaPhone className="text-primary mt-1" />
                <a href="tel:+2349012345678" className="hover:underline">
                  +234 901 234 5678
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Find Us on Google Maps</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              title="Google Maps location"
              className="rounded-lg"
            ></iframe>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="bg-neutral-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-blue-900">
            Frequently Asked Questions
          </h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-6">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h4 className="text-lg font-semibold mb-2 text-blue-900">
                  {item.question}
                </h4>
                <p className="text-neutral-dark">{item.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-semibold mb-6 text-blue-900">Connect With Us</h2>
        <div className="flex justify-center gap-6 text-3xl text-primary">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
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
              <h3 className="text-3xl font-bold text-blue-800">We're Here to Help You Succeed</h3>
              <p className="max-w-2xl mx-auto mt-3 text-gray-700">Don't hesitate to reach out. Our team in Lekki, Lagos is ready to answer your questions and provide the support you need.</p>
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