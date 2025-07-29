// Compact Campaign Card - Mobile-First Design
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  location: string;
  category: string;
  raised: number;
  contributors: number;
  createdAt: string;
}

interface CompactCampaignCardProps {
  campaign: Campaign;
}

export function CompactCampaignCard({ campaign }: CompactCampaignCardProps) {
  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);

  return (
    <Link to={`/campaign/${campaign.id}`}>
      <div className="group relative bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] p-5 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
              <span className="text-xs text-blue-300 font-medium">
                {campaign.category}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-sm mb-3 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
            {campaign.title}
          </h3>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">
                ${campaign.raised.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                of ${campaign.goal.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-gray-400">
              <div>
                {campaign.contributors} supporters
              </div>
              {campaign.location && (
                <div>
                  {campaign.location.split(',')[0]}
                </div>
              )}
            </div>
            <div className="text-blue-400 font-medium">
              {progressPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
