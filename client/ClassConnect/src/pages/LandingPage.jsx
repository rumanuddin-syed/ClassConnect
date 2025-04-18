import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaFileAlt, FaComments, FaShieldAlt, FaLinkedin, FaTwitter, FaGithub, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon: Icon, title, desc, index }) => {
  const ref = useRef(null);
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl space-y-3 sm:space-y-4 border-2 border-blue-50 hover:border-blue-100 transition-colors relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-3 sm:p-4 bg-blue-100 w-fit rounded-xl sm:rounded-2xl">
        <Icon className="text-3xl sm:text-4xl text-blue-600" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-blue-900">{title}</h3>
      <p className="text-sm sm:text-base text-blue-600">{desc}</p>
    </motion.div>
  );
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const underlineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLoginRedirect = () => {
    navigate("/login");
  };
  const handleSignUpRedirect =()=>{
    navigate("/signup");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 font-sans overflow-hidden" ref={containerRef}>
      {/* Responsive Navbar */}
      <nav className="w-full left-0 py-4 sm:py-6 bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl fixed top-0 z-50 px-4 sm:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight relative overflow-hidden">
            <span className="relative z-10">ClassConnect</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30"
              animate={{
                left: ["-100%", "150%", "-100%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </h1>
          
          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden text-white text-2xl z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-6">
           
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold shadow-md transition-colors"
              onClick={handleLoginRedirect}
            >
              Login
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="pt-4 pb-6 space-y-4 flex flex-col">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold shadow-md transition-colors mt-2"
                  onClick={() => {
                    handleLoginRedirect();
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Scroll Progress Line */}
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-yellow-400 shadow-lg"
          style={{ width: lineWidth }}
        />
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-white mt-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-6 sm:space-y-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 leading-tight">
              Revolutionize Your
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Classroom Dynamics
              </span>
            </h1>
            <p className="text-base sm:text-xl text-blue-600 max-w-2xl">
              Transform traditional education into an interactive, collaborative experience 
              with our all-in-one platform designed for modern educators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-md sm:shadow-lg transition-colors"
                onClick={handleSignUpRedirect}
              >
                <span>Get Started</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-20 rounded-lg sm:rounded-xl"
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.95, rotate: -3 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex-1 relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border-2 border-blue-100 mt-8 sm:mt-0"
          >
            <motion.div 
              className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-400 rounded-xl sm:rounded-2xl transform rotate-12"
              animate={{ rotate: [12, -12, 12] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative space-y-4 sm:space-y-6">
              <div className="p-4 sm:p-6 bg-blue-100 rounded-xl sm:rounded-2xl">
                <FaUsers className="text-3xl sm:text-4xl text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900">Interactive Learning Ecosystem</h3>
              <p className="text-sm sm:text-base text-blue-600">Experience seamless integration of teaching tools and student engagement metrics</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-12 sm:mb-16 text-blue-900"
          >
            Powerful Features, Simplified Workflow
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              index={0}
              icon={FaUsers}
              title="Smart Attendance"
              desc="AI-powered facial recognition and geolocation tracking"
            />
            <FeatureCard
              index={1}
              icon={FaFileAlt}
              title="Resource Hub"
              desc="Cloud-based storage with version control and collaboration"
            />
            <FeatureCard
              index={2}
              icon={FaCalendarAlt}
              title="Auto-Scheduling"
              desc="Intelligent calendar integration with conflict detection"
            />
            <FeatureCard
              index={3}
              icon={FaComments}
              title="Live Collaboration"
              desc="Real-time document editing and chat features"
            />
            <FeatureCard
              index={4}
              icon={FaChalkboardTeacher}
              title="Classroom Moments"
              desc="Automated highlight reels from class sessions"
            />
            <FeatureCard
              index={5}
              icon={FaShieldAlt}
              title="Secure Platform"
              desc="Enterprise-grade security with end-to-end encryption"
            />
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-2xl sm:text-3xl md:text-4xl font-black mb-6 text-white"
          >
            Ready to Transform Your Classroom?
          </motion.h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of educators who are already enhancing their teaching experience with ClassConnect.
          </p>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        className="bg-blue-900 text-white py-12 sm:py-16 px-4 sm:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">ClassConnect</h3>
            <p className="text-sm sm:text-base text-blue-200">Empowering educators since 2023</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="space-y-2 text-sm sm:text-base text-blue-200">
              <li className="hover:text-white cursor-pointer transition-colors">Features</li>
              <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-white cursor-pointer transition-colors">Case Studies</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Company</h4>
            <ul className="space-y-2 text-sm sm:text-base text-blue-200">
              <li className="hover:text-white cursor-pointer transition-colors">About</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <FaTwitter className="text-xl sm:text-2xl cursor-pointer hover:text-blue-300 transition-colors" />
              <FaLinkedin className="text-xl sm:text-2xl cursor-pointer hover:text-blue-300 transition-colors" />
              <FaGithub className="text-xl sm:text-2xl cursor-pointer hover:text-blue-300 transition-colors" />
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-blue-700 text-center text-sm sm:text-base text-blue-300">
          © 2023 ClassConnect. All rights reserved.
        </div>
      </motion.footer>

      {/* Floating Action */}
      <motion.div 
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div 
          className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-xl sm:rounded-2xl shadow-lg cursor-pointer flex items-center justify-center relative overflow-hidden"
          onClick={handleLoginRedirect}
        >
          <span className="text-xl sm:text-2xl z-10">🚀</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </div>
  );
}