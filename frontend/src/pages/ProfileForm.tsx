import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileService } from '@/lib/profile';
import { useAuth } from '@/contexts/AuthContext';

const ProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: '',
    profession: '',
    company: '',
    skills: '',
    interests: '',
    profilePicture: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadProfileImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingImage(true);
      toast({ title: 'Uploading image...', description: 'Please wait while we upload your profile picture.' });

      try {
        const API_KEY = 'f21236a63fd3908f258ffa7bc0314eef';
        const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

        const data = new FormData();
        data.append('image', file);

        const res = await fetch(`${IMGBB_API_URL}?key=${API_KEY}`, {
          method: 'POST',
          body: data,
        });
        const json = await res.json();

        if (json.success) {
          const url = json.data.url as string;
          setFormData((prev) => ({ ...prev, profilePicture: url }));
          toast({ title: 'Image uploaded', description: 'Profile picture updated.' });
        } else {
          throw new Error(json.error?.message || 'Upload failed');
        }
      } catch (err) {
        toast({ title: 'Upload failed', description: 'Failed to upload image. Please try again.', variant: 'destructive' });
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  // Check if we're editing (URL contains /edit)
  React.useEffect(() => {
    const isEditMode = window.location.pathname.includes('/edit');
    setIsEditing(isEditMode);
    
    if (isEditMode) {
      // Load existing profile data
      loadExistingProfile();
    } else {
      setInitialLoading(false);
    }
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await ProfileService.getMyProfile();
      if (response.success && response.data) {
        const profile = response.data;
        const sl = (profile as any).socialLinks || {};
        setFormData({
          bio: profile.bio || '',
          location: profile.location || '',
          website: sl.website || profile.website || '',
          twitter: sl.twitter || profile.twitter || '',
          linkedin: sl.linkedin || profile.linkedin || '',
          github: sl.github || profile.github || '',
          profession: profile.profession || '',
          company: profile.company || '',
          skills: profile.skills ? profile.skills.join(', ') : '',
          interests: profile.interests ? profile.interests.join(', ') : '',
          profilePicture: profile.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Normalize social links to full URLs
  const ensureHttp = (val?: string) => {
    if (!val) return '';
    const v = val.trim();
    if (!v) return '';
    return v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`;
  };
  const normalizeTwitter = (val?: string) => {
    const v = (val || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const noAt = v.replace(/^@+/, '');
    if (/^(?:www\.)?twitter\.com\//i.test(noAt)) return ensureHttp(noAt);
    return `https://twitter.com/${noAt}`;
  };
  const normalizeLinkedIn = (val?: string) => {
    const v = (val || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    if (/^(?:www\.)?linkedin\.com\//i.test(v)) return ensureHttp(v);
    return `https://linkedin.com/in/${v}`;
  };
  const normalizeGithub = (val?: string) => {
    const v = (val || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    if (/^(?:www\.)?github\.com\//i.test(v)) return ensureHttp(v);
    return `https://github.com/${v}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert skills and interests from comma-separated strings to arrays and normalize social URLs
      const profileData = {
        ...formData,
        twitter: normalizeTwitter(formData.twitter),
        linkedin: normalizeLinkedIn(formData.linkedin),
        github: normalizeGithub(formData.github),
        website: ensureHttp(formData.website),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        interests: formData.interests.split(',').map(interest => interest.trim()).filter(interest => interest)
      };

      const response = await ProfileService.upsertMyProfile(profileData);

      if (response.success) {
        toast({
          title: isEditing ? "Profile Updated Successfully" : "Profile Created Successfully",
          description: isEditing ? "Your profile has been updated." : "Your profile has been set up. Welcome to Innova Write Hub!",
        });
        navigate('/profile');
      } else {
        toast({
          title: isEditing ? "Profile Update Failed" : "Profile Creation Failed",
          description: response.message || `Failed to ${isEditing ? 'update' : 'create'} profile. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: isEditing ? "Profile Update Failed" : "Profile Creation Failed",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} profile. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Allow users to skip profile setup and go directly to their profile
    navigate('/profile');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update your profile information below.' 
                : `Welcome ${user?.name}! Let's set up your profile to get started.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio Section */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              {/* Profile Picture */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Button type="button" size="sm" variant="secondary" onClick={handleUploadProfileImage} disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                <Input
                  id="profilePicture"
                  name="profilePicture"
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.profilePicture}
                  onChange={handleInputChange}
                />
                {formData.profilePicture && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.profilePicture}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover border"
                      onError={(e) => ((e.currentTarget.style.display = 'none'))}
                    />
                    <p className="text-xs text-muted-foreground">Preview</p>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    name="profession"
                    placeholder="e.g., Software Developer"
                    value={formData.profession}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Tech Corp"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., New York, USA"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      placeholder="@username"
                      value={formData.twitter}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      placeholder="linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      name="github"
                      placeholder="github.com/username"
                      value={formData.github}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Skills and Interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    name="skills"
                    placeholder="JavaScript, React, Node.js (comma separated)"
                    value={formData.skills}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    name="interests"
                    placeholder="Technology, Writing, Travel (comma separated)"
                    value={formData.interests}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Separate interests with commas</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading 
                    ? (isEditing ? 'Updating Profile...' : 'Creating Profile...') 
                    : (isEditing ? 'Update Profile' : 'Complete Profile')
                  }
                </Button>
                {!isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSkipForNow}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                )}
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileForm;