import React from 'react';

interface PageSkeletonProps {
  title?: boolean;
  breadcrumbs?: boolean;
  tabs?: number;
  cards?: number;
  table?: boolean;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  title = true,
  breadcrumbs = true,
  tabs = 0,
  cards = 0,
  table = false
}) => {
  return (
    <div className="animate-pulse">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="mb-6 flex items-center space-x-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      )}

      {/* Page Title */}
      {title && (
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      )}

      {/* Tabs */}
      {tabs > 0 && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {Array.from({ length: tabs }).map((_, index) => (
              <div key={index} className="pb-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {cards > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
              </div>
              <div className="mt-4 h-10 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {table && (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex space-x-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded flex-1"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div key={rowIndex} className="px-6 py-4">
                <div className="flex space-x-4">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-100 rounded flex-1"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Form Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Form sections */}
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <div className="h-5 w-32 bg-gray-300 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-100 rounded border"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <div className="h-10 w-24 bg-blue-200 rounded"></div>
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton; 