"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const quickResponses = [
  "👋 Hi! I'd like to discuss a project",
  "💼 Interested in hiring you",
  "🤝 Let's collaborate",
  "❓ I have a question",
];

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline] = useState(true);

  const handleQuickResponse = (message: string) => {
    const phoneNumber = "94769809256";
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online Status Indicator */}
        {isOnline && !isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-80 glass rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Anjana Rodrigo</div>
                  <div className="text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    {isOnline ? "Online now" : "Offline"}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 bg-[url('/whatsapp-bg.png')] bg-repeat min-h-[200px]">
              {/* Bot Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-md max-w-[80%]">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    👋 Hi! I'm Anjana. How can I help you today?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Just now
                  </p>
                </div>
              </motion.div>

              {/* Typing Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Responses */}
            <div className="p-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                Quick responses:
              </p>
              {quickResponses.map((response, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left p-3 glass rounded-lg hover:bg-[#25D366]/10 hover:border-[#25D366] border border-border transition-all text-sm"
                >
                  {response}
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/50 text-center">
              <a
                href="https://wa.me/94769809256?text=Hi%20Anjana,%20I%20visited%20your%20portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#25D366] hover:underline font-medium"
              >
                Open in WhatsApp →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
