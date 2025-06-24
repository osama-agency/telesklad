import React from 'react'
import LoaderOne from './loader-one'

interface LoadingWrapperProps {
    className?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ className = '' }) => {
    return (
        <div className={`h-[calc(100vh-200px)] w-full flex items-center justify-center ${className}`}>
            <LoaderOne />
        </div>
    )
}

export default LoadingWrapper 