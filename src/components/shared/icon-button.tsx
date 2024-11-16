import React from "react";

import { motion } from "framer-motion";

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const IconButton = ({ children, onClick }: IconButtonProps) => {
  return (
    <div
      className="relative flex items-center justify-center"
      role="button"
      onClick={onClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
        }}
        className="absolute size-10 rounded-full bg-muted-foreground/20"
      />
      {children}
    </div>
  );
};
