import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Twitter, Facebook, MessageCircle, Link2, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Campaign } from '@/lib/supabase';

interface SocialShareProps {
  campaign: Campaign;
  className?: string;
}

export function SocialShare({ campaign, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
  const shareText = `Help support "${campaign.title}" - ${campaign.description.slice(0, 100)}... Goal: $${campaign.goal.toLocaleString()}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}&hashtags=crowdfunding,basefunded`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${campaignUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      toast({
        title: "✅ Link Copied!",
        description: "Campaign link copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "❌ Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const openShareWindow = (url: string, platform: string) => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: shareLinks.twitter
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: shareLinks.facebook
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: shareLinks.whatsapp
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-400 hover:bg-blue-500',
      url: shareLinks.telegram
    },
    {
      name: 'LinkedIn',
      icon: Share2,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: shareLinks.linkedin
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Share this Campaign</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Share Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Help spread the word!</span>
          <Badge variant="secondary">
            {Math.round((campaign.raised / campaign.goal) * 100)}% funded
          </Badge>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shareButtons.map((button) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={button.name}
                onClick={() => openShareWindow(button.url, button.name.toLowerCase())}
                className={`${button.color} text-white flex items-center space-x-2 h-10`}
                size="sm"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{button.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Copy Link */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono">
              {campaignUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Sharing Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share on multiple platforms for maximum reach</li>
            <li>• Add a personal message about why you support this cause</li>
            <li>• Tag friends who might be interested</li>
            <li>• Share updates as the campaign progresses</li>
          </ul>
        </div>

        {/* Share Incentive */}
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Every share matters!</strong>
          </p>
          <p className="text-xs text-gray-600">
            Campaigns that are shared 10+ times are 3x more likely to reach their goal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
