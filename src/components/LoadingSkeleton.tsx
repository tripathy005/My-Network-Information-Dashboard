import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-[#141722] border-3 border-black shadow-[5px_5px_0px_0px_#facc15] h-64 flex flex-col"
        >
          {/* Header Skeleton */}
          <div className="h-11 bg-[#facc15]/30 border-b-3 border-black px-4 flex items-center justify-between">
            <div className="w-32 h-5 bg-black/40 rounded-none" />
            <div className="w-16 h-4 bg-black/40 rounded-none" />
          </div>

          {/* Body Skeleton */}
          <div className="p-4 flex-1 space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-8 bg-[#0e101a] border border-slate-800 p-2 flex justify-between items-center">
                <div className="w-20 h-3 bg-slate-800" />
                <div className="w-28 h-3 bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
