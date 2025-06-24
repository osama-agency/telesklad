import React from 'react'
import { motion } from "framer-motion";
import '@/styles/loader.scss';

const LoaderOne = () => {
    return (
        <div className="flex items-center justify-center gap-1">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full bg-[#4CAF50]"
                    initial={{ y: 0 }}
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    )
}

export default LoaderOne 