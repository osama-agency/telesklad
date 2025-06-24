'use client';

import React from 'react';
import LoadingWrapper from '@/components/ui/loading-wrapper';

interface SkeletonLoadingProps {
    type?: string;
  count?: number;
  className?: string;
}

const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
    type = 'subscription',
    count = 1,
  className = ''
}) => {
    return <LoadingWrapper className={className} />;
};

export default SkeletonLoading; 