import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileService } from '@/lib/profile';
import { BlogService } from '@/lib/blog';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Globe, Twitter, Linkedin, Github, Building, Briefcase, Edit, Plus } from 'lucide-react';

interface Profile {
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  profession?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
  profilePicture?: string;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  visibility: 'pending' | 'approved' | 'rejected' | 'hidden';
  timestamps: {
    createdAt: string;
  };
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchMyBlogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBlogs = async () => {
    try {
      const response = await BlogService.getMyBlogs();
      if (response.success && response.data) {
        setBlogs(response.data.blogs || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const getStatusColor = (blog: Blog) => {
    if (blog.status === 'draft') return 'bg-gray-500';
    switch (blog.visibility) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'hidden': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (blog: Blog) => {
    if (blog.status === 'draft') return 'Draft';
    switch (blog.visibility) {
      case 'approved': return 'Published';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      case 'hidden': return 'Hidden';
      default: return blog.visibility;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={profile?.profilePicture} alt={user?.name || user?.username || 'Profile'} />
                    <AvatarFallback>
                      {(user?.name || user?.username || user?.email || 'U')
                        .toString()
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{user?.name || user?.username || user?.email}</CardTitle>
                    <CardDescription className="text-lg">{user?.email}</CardDescription>
                  </div>
                </div>
                <Button onClick={() => navigate('/profile/edit')} variant="outline" className="w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile ? (
                <>
                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.profession && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.profession}</span>
                      </div>
                    )}
                    {profile.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.company}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {(profile as any)?.socialLinks?.website || profile?.website ? (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={(profile as any)?.socialLinks?.website || profile?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    ) : null}
                  </div>

                  {/* Social Links */}
                  {(((profile as any)?.socialLinks?.twitter) || ((profile as any)?.socialLinks?.linkedin) || ((profile as any)?.socialLinks?.github) || profile.twitter || profile.linkedin || profile.github) && (
                    <div>
                      <h3 className="font-semibold mb-2">Social Links</h3>
                      <div className="flex gap-4">
                        {(((profile as any)?.socialLinks?.twitter) || profile.twitter) && (() => {
                          const raw = (((profile as any)?.socialLinks?.twitter) || profile.twitter || '').trim();
                          const href = raw.startsWith('http') ? raw : `https://twitter.com/${raw.replace(/^@+/, '')}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                              <Twitter className="w-4 h-4" />
                              Twitter
                            </a>
                          );
                        })()}
                        {(((profile as any)?.socialLinks?.linkedin) || profile.linkedin) && (() => {
                          const raw = (((profile as any)?.socialLinks?.linkedin) || profile.linkedin || '').trim();
                          const href = raw.startsWith('http') ? raw : `https://${raw}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline">
                              <Linkedin className="w-4 h-4" />
                              LinkedIn
                            </a>
                          );
                        })()}
                        {(((profile as any)?.socialLinks?.github) || profile.github) && (() => {
                          const raw = (((profile as any)?.socialLinks?.github) || profile.github || '').trim();
                          const href = raw.startsWith('http') ? raw : `https://${raw}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-700 hover:underline">
                              <Github className="w-4 h-4" />
                              GitHub
                            </a>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Your profile is not complete yet.</p>
                  <Button onClick={() => navigate('/profile/setup')}>
                    Complete Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;