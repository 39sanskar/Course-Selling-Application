import React from 'react';

function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5 shadow-lg animate-pulse">
      <div className="bg-gray-300 dark:bg-gray-600 rounded-lg mb-4 w-full h-40"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 line-clamp-3"></div> {/* For description */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/5"></div>
      </div>
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg w-full"></div>
    </div>
  );
}

export default CourseCardSkeleton;
