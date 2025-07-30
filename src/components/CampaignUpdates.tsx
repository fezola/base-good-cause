import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, Calendar, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  created_at: string;
  creator_id: string;
  likes_count: number;
  comments_count: number;
}

interface CampaignUpdatesProps {
  campaignId: string;
  isCreator: boolean;
  className?: string;
}

export function CampaignUpdates({ campaignId, isCreator, className = "" }: CampaignUpdatesProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async () => {
    if (!user || !newUpdate.title.trim() || !newUpdate.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('campaign_updates')
        .insert({
          campaign_id: campaignId,
          title: newUpdate.title.trim(),
          content: newUpdate.content.trim(),
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setUpdates([data, ...updates]);
      setNewUpdate({ title: '', content: '' });
      setShowCreateForm(false);

      toast({
        title: "✅ Update Posted!",
        description: "Your campaign update has been shared with contributors.",
        duration: 3000
      });

    } catch (error) {
      console.error('Failed to create update:', error);
      toast({
        title: "❌ Failed to Post",
        description: "Could not post update. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Campaign Updates</span>
              </CardTitle>
              <CardDescription>
                Stay updated with the latest news from the campaign creator
              </CardDescription>
            </div>
            {isCreator && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Post Update</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Create Update Form */}
        {showCreateForm && isCreator && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <Input
                placeholder="Update title..."
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                className="font-medium"
              />
              <Textarea
                placeholder="Share an update with your contributors..."
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                rows={4}
              />
              <div className="flex space-x-2">
                <Button
                  onClick={createUpdate}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Posting...' : 'Post Update'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Updates List */}
      {updates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
            <p className="text-gray-500">
              {isCreator 
                ? "Share your first update to keep contributors engaged!"
                : "The campaign creator hasn't posted any updates yet."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      CR
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{update.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="secondary">Creator</Badge>
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimeAgo(update.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                    
                    <div className="flex items-center space-x-4 pt-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{update.likes_count || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{update.comments_count || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
