import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";

const ToggleButton = ({ sidebarOpen, setSidebarOpen, isMobile }) => {

  return (
    <AnimatePresence>
      {!sidebarOpen && (isMobile?(
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1 left-1 bg-blue-800 text-white p-3 rounded-lg shadow-xl z-50"
        >
          <FaBars />
        </motion.button>
      ):<motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setSidebarOpen(true)}
      className="fixed top-8 left-8 bg-blue-800 text-white p-4 rounded-lg shadow-xl z-50"
    >
      <FaBars />
    </motion.button>)}
    </AnimatePresence>
  );
};

export default ToggleButton;