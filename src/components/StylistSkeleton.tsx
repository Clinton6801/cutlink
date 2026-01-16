export const StylistSkeleton = () => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
    {/* Image Area */}
    <div className="h-48 bg-gray-800" />
    
    <div className="p-6 space-y-4">
      {/* Name and Badge */}
      <div className="flex justify-between">
        <div className="h-6 w-1/2 bg-gray-800 rounded" />
        <div className="h-6 w-6 bg-gray-800 rounded-full" />
      </div>
      
      {/* Rating/Exp Row */}
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-gray-800 rounded" />
        <div className="h-4 w-24 bg-gray-800 rounded" />
      </div>
      
      {/* Bio Lines */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-800 rounded" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-800 rounded-full" />
        <div className="h-6 w-16 bg-gray-800 rounded-full" />
      </div>
      
      {/* Button */}
      <div className="h-12 w-full bg-gray-800 rounded-lg mt-4" />
    </div>
  </div>
)