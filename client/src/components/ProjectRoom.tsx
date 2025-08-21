import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaSpinner, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Define the Idea and ProjectDetails interfaces
interface Idea {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: { toDate: () => Date };
}

interface ProjectDetails {
  id: string;
  title: string;
  goals: string;
  description: string;
  creatorId: string;
  members: string[];
}

const ProjectRoom: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The useRef hook for scrolling is now unused but kept for clarity.
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // The scrollToBottom function has been removed.
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // Fetch project data and set up a real-time listener for ideas
  useEffect(() => {
    if (!projectId || !currentUser) {
      setLoading(false);
      return;
    }

    const fetchProjectAndIdeas = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          setError("Project not found.");
          setLoading(false);
          return;
        }

        const projectData = projectSnap.data() as ProjectDetails;

        if (!projectData.members.includes(currentUser.uid)) {
          setError("Access denied. You are not a member of this project.");
          setLoading(false);
          return;
        }

        setProject({ ...projectData, id: projectSnap.id });

        // Set up a real-time listener for ideas, ordered by creation time
        const ideasQuery = query(collection(db, 'projects', projectId, 'ideas'), orderBy('createdAt'));
        const unsubscribe = onSnapshot(ideasQuery, (querySnapshot) => {
          const fetchedIdeas: Idea[] = [];
          querySnapshot.forEach((doc) => {
            const idea = { id: doc.id, ...doc.data() } as Idea;
            fetchedIdeas.push(idea);
          });
          
          setIdeas(fetchedIdeas);
          setLoading(false);
        });

        return () => unsubscribe(); // Cleanup the listener
      } catch (err) {
        console.error('Failed to fetch project data:', err);
        setError("Failed to load project. Please check your connection.");
        setLoading(false);
      }
    };

    fetchProjectAndIdeas();
  }, [projectId, currentUser]);

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim() || !currentUser || !projectId) return;

    setSubmitLoading(true);
    try {
      const ideasRef = collection(db, 'projects', projectId, 'ideas');
      const newIdeaData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        content: newIdea,
        createdAt: new Date(),
      };
      await addDoc(ideasRef, newIdeaData);
      setNewIdea('');
    } catch (err) {
      console.error('Failed to submit idea:', err);
      alert('Failed to submit idea. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-900">
        <FaSpinner className="animate-spin text-primary text-6xl" />
      </div>
    );
  }

  // Error and not-found state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-neutral-900 text-white">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <a href="/dashboard" className="flex items-center text-primary hover:underline transition-colors">
          <FaArrowLeft className="mr-2" /> Go back to Dashboard
        </a>
      </div>
    );
  }

  // Main component content
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-black p-4 sm:p-8 pt-16 mt-16 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Project Header Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-white/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">
            {project?.title}
          </h1>
          <p className="text-neutral-300 text-lg mb-4">{project?.description}</p>
          <div className="flex items-center text-neutral-400 text-sm">
            <FaUsers className="mr-2" />
            <span>{project?.members.length} Members</span>
          </div>
        </motion.div>

        {/* Project Chat Interface */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/20 flex flex-col h-[70vh] md:h-[80vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Project Whiteboard</h2>
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence>
              {ideas.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-center text-neutral-400 italic">No ideas shared yet. Be the first to add a sticky note! 📝</p>
                </div>
              ) : (
                ideas.map((idea) => {
                  const isSender = idea.userId === currentUser?.uid;
                  return (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex mb-2 ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-4 rounded-xl shadow-lg relative max-w-[80%] md:max-w-[60%] ${isSender ? 'bg-primary/80 text-white rounded-br-none' : 'bg-neutral-800 text-neutral-200 rounded-bl-none'}`}>
                        <p className="break-words">{idea.content}</p>
                        <div className={`flex items-center mt-2 text-xs ${isSender ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-neutral-400 mr-2">
                            {idea.userName}
                          </span>
                          <span className="text-neutral-400 mr-1">
                            {idea.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                }))}
            </AnimatePresence>
          </div>
          
          {/* Idea submission form */}
          <form onSubmit={handleSubmitIdea} className="flex items-center space-x-2 mt-4">
            <textarea
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Share your idea..."
              className="flex-grow p-4 border border-neutral-700 bg-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/80 transition-colors placeholder-neutral-500"
              rows={1}
              required
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-primary text-white p-4 rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitLoading || !newIdea.trim()}
            >
              {submitLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectRoom;