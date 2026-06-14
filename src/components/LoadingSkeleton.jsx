import { memo } from 'react'
import { motion } from 'framer-motion'

const SkeletonCard = memo(function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header Skeleton */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 
                        animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg 
                          animate-pulse mb-2 w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg 
                          animate-pulse w-1/2" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg 
                        animate-pulse" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg 
                        animate-pulse w-5/6" />
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg 
                       animate-pulse"
          />
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-3 
                      border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg 
                        animate-pulse" />
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg 
                        animate-pulse" />
      </div>
    </motion.div>
  )
})

export default function LoadingSkeleton({ count = 8, viewMode = 'grid' }) {
  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
    }>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  )
}
