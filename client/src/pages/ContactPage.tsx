import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const { currentUser } = useAuth(); // Get the current user's login status

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    // In a real application, you would send this data to a backend endpoint.
    // For now, we'll just simulate a successful submission.
    setTimeout(() => {
      console.log({ name, email, message });
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  const faq = [
    {
      question: 'What are your business hours?',
      answer: 'Our office is open Monday to Friday from 9:00 AM to 5:00 PM WAT.',
    },
    {
      question: 'How long will it take to get a response?',
      answer: 'We aim to respond to all inquiries within 24 business hours.',
    },
    {
      question: 'Do you offer support on weekends?',
      answer: 'While our regular business hours are Monday to Friday, we do monitor urgent requests occasionally on weekends.',
    },
  ];

  const renderCtaButton = () => {
    if (currentUser) {
      return (
        <Link to="/dashboard">
          <button className="bg-accent text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400">
            Go to Dashboard
          </button>
        </Link>
      );
    } else {
      return (
        <Link to="/signup">
          <button className="bg-accent text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-400">
            Get Started for Free
          </button>
        </Link>
      );
    }
  };

  return (
    <div className="bg-neutral-100 min-h-screen py-20 pb-2">
      
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32 flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out"
          style={{ backgroundImage: 'url(https://www.shutterstock.com/image-photo/using-laptop-show-icon-address-600nw-2521386695.jpg)' }}
          role="img"
          aria-label="Laptop screen showing contact information icons like a location pin, an email envelope, and a phone, set against a blurred city background."
        >
          <div className="absolute inset-0 bg-secondary opacity-60"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight animate-slide-up">
            Contact Our Team in Lekki, Lagos
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl mx-auto animate-slide-up animation-delay-300">
            We're here to help you navigate your graduate school applications. Reach out with any questions or feedback.
          </p>
        </div>
      </section>

      {/* Contact Form & Information Grid */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 animate-slide-up">
              <h2 className="text-2xl font-bold text-secondary mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-secondary font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-secondary font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-secondary font-semibold mb-2">Message</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    rows={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                >
                  {status || 'Send Message'}
                </button>
              </form>
              {status && (
                <p className="mt-4 text-center text-primary font-semibold">
                  {status}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-8 animate-slide-up animation-delay-200">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200">
                <h3 className="text-xl font-bold text-secondary mb-4">Our Office in Lekki</h3>
                <div className="text-neutral-500 space-y-4">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" size={20} />
                    <address className="not-italic">
                      12A, Adewale Kolawole Crescent,<br />
                      Lekki Phase 1,<br />
                      Lagos State,<br />
                      Nigeria
                    </address>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-primary flex-shrink-0" size={20} />
                    <a href="mailto:info.ng@yourdomain.com" className="hover:underline text-secondary font-semibold">info.ng@yourdomain.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary flex-shrink-0" size={20} />
                    <a href="tel:+2349012345678" className="hover:underline text-secondary font-semibold">+234 901 234 5678</a>
                  </div>
                </div>
              </div>

              {/* Map Embed */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-200 animate-slide-up animation-delay-400">
                <h3 className="text-xl font-bold text-secondary mb-4">Find Us on Google Maps</h3>
                <div className="overflow-hidden rounded-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.6738917835157!2d3.447833215286591!3d6.435764026367339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf47b7c25a075%3A0x28639f758782a466!2s12A%20Adewale%20Kolawole%20Cres%2C%20Lekki%20Phase%201%20106104%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1625064560000!5m2!1sen!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps location of our office in Lekki, Lagos"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-secondary mb-12 animate-slide-up">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faq.map((item, index) => (
              <div key={index} className="bg-neutral-100 p-6 rounded-lg shadow-inner border border-neutral-200 animate-slide-up">
                <h4 className="text-xl font-semibold text-secondary mb-2">{item.question}</h4>
                <p className="text-neutral-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect on Social Media */}
      <section className="bg-neutral-100 py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-secondary mb-6 animate-slide-up">
            Connect With Us
          </h2>
          <div className="flex justify-center space-x-6 text-primary text-3xl animate-slide-up animation-delay-200">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><FaLinkedin /></a>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-primary py-20 sm:py-28">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 animate-slide-up">
            {currentUser ? "Ready to get back to your applications?" : "We're Here to Help You Succeed"}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
            {currentUser ? "Head to your dashboard to manage your applications and deadlines." : "Don't hesitate to reach out. Our team in Lekki, Lagos is ready to answer your questions and provide the support you need."}
          </p>
          {renderCtaButton()}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;