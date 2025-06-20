"use client";
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-slate-200 hover:text-white dark:text-white"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-slate-800/95 dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-600/50 dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-slate-600/50 dark:bg-black dark:border-white/[0.2] bg-slate-800/80 backdrop-blur-xl shadow-lg flex justify-center space-x-4 px-8 py-6"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(href)} 
      className="flex space-x-2 text-left hover:bg-slate-700/30 p-2 rounded-lg transition-colors"
    >
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl object-cover"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-slate-100 dark:text-white">
          {title}
        </h4>
        <p className="text-slate-300 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </button>
  );
};

export const HoveredLink = ({ children, href, ...rest }: any) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className="text-slate-300 dark:text-neutral-200 hover:text-white transition-colors text-left"
      {...rest}
    >
      {children}
    </button>
  );
};