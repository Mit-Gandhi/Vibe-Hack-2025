import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ProfileService, Profile as ProfileType } from '@/lib/profile';
import { MapPin, Globe, Twitter, Linkedin, Github, Briefcase, Building } from 'lucide-react';

const normalizeHref = (raw?: string) => {
  const v = (raw || '').trim();
  if (!v) return '';
  return v.startsWith('http') ? v : `https://${v}`;
};

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Missing user id');
      return ProfileService.getProfileByUserId(userId);
    },
    enabled: !!userId
  });

  const profile: ProfileType | null = (data && data.success && data.data) ? (data.data as any) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="text-center">Loading profile...</div>
          ) : isError || !profile ? (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Unable to load this profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This user may not have a public profile.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={profile.profilePicture} alt={profile?.userId || 'User'} />
                        <AvatarFallback>
                          {(profile?.userId || 'U').toString().trim().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl truncate">{(profile as any).fullName || 'User'}</CardTitle>
                        {profile.bio && (
                          <CardDescription className="text-base line-clamp-2">{profile.bio}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/articles">Back to articles</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(profile as any).profession && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{(profile as any).profession}</span>
                      </div>
                    )}
                    {(profile as any).company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{(profile as any).company}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {((profile as any).socialLinks?.website || (profile as any).website) && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={normalizeHref((profile as any).socialLinks?.website || (profile as any).website)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                          {normalizeHref((profile as any).socialLinks?.website || (profile as any).website)}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {((profile as any).socialLinks?.twitter || (profile as any).socialLinks?.linkedin || (profile as any).socialLinks?.github || (profile as any).twitter || (profile as any).linkedin || (profile as any).github) && (
                    <div>
                      <h3 className="font-semibold mb-2">Social Links</h3>
                      <div className="flex gap-4">
                        {(((profile as any).socialLinks?.twitter) || (profile as any).twitter) && (() => {
                          const raw = (((profile as any).socialLinks?.twitter) || (profile as any).twitter || '').trim();
                          const href = raw.startsWith('http') ? raw : `https://twitter.com/${raw.replace(/^@+/, '')}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                              <Twitter className="w-4 h-4" />
                              Twitter
                            </a>
                          );
                        })()}
                        {(((profile as any).socialLinks?.linkedin) || (profile as any).linkedin) && (() => {
                          const raw = (((profile as any).socialLinks?.linkedin) || (profile as any).linkedin || '').trim();
                          const href = raw.startsWith('http') ? raw : `https://${raw}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline">
                              <Linkedin className="w-4 h-4" />
                              LinkedIn
                            </a>
                          );
                        })()}
                        {(((profile as any).socialLinks?.github) || (profile as any).github) && (() => {
                          const raw = (((profile as any).socialLinks?.github) || (profile as any).github || '').trim();
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
                  {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s, i) => (
                          <Badge key={i} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {Array.isArray(profile.interests) && profile.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((it, i) => (
                          <Badge key={i} variant="outline">{it}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-2" />
                  <div className="text-sm text-muted-foreground">Profile last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;