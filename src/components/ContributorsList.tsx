import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Contributor {
  id: string;
  campaignId?: string;
  address?: string;
  amount: number;
  timestamp: string | Date;
  ensName?: string;
  transactionHash?: string;
  blockNumber?: number;
  userInfo?: {
    email?: string;
    name?: {
      firstName: string;
      familyName: string;
    };
  };
}

interface ContributorsListProps {
  contributors: Contributor[];
  className?: string;
}

export function ContributorsList({ contributors, className }: ContributorsListProps) {
  const formatAddress = (address?: string) => {
    if (!address) return 'Anonymous';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAvatarInitials = (address?: string) => {
    if (!address) return 'AN';
    return address.slice(2, 4).toUpperCase();
  };

  const formatTimeAgo = (date: string | Date | undefined) => {
    if (!date) return "recently";

    const now = new Date();
    const contributorDate = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (!contributorDate || isNaN(contributorDate.getTime())) {
      return "recently";
    }

    const diffInMinutes = Math.floor((now.getTime() - contributorDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className={`p-6 shadow-elevation ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          Recent Contributors
        </h3>
        <Badge variant="secondary" className="text-sm">
          {contributors.length} supporters
        </Badge>
      </div>
      
      {contributors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg mb-2">Be the first to contribute!</p>
          <p className="text-sm">Your support can make a real difference.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
                    {getAvatarInitials(contributor.address || contributor.wallet_address || 'Anonymous')}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-medium text-foreground">
                    {contributor.userInfo?.name?.firstName
                      ? `${contributor.userInfo.name.firstName} ${contributor.userInfo.name.familyName || ''}`.trim()
                      : contributor.ensName || formatAddress(contributor.address || contributor.wallet_address || 'Anonymous')
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(contributor.timestamp || contributor.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-success">
                  +${contributor.amount}
                </div>
                <div className="text-xs text-muted-foreground">
                  USDC
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}