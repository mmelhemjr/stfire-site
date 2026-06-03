import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Calendar, ChevronRight, Upload, Loader2, Star, Gift, Bell, MapPin, Users, History, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import AuthModal from '../components/AuthModal';
import { format } from 'date-fns';
import type { UserProfile, Area, TableType, SpecialDates } from '../lib/types';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchProfile();
    fetchAreas();
    fetchTableTypes();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setEditedProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAreas = async () => {
    const { data } = await supabase.from('areas').select('*').order('name');
    if (data) setAreas(data);
  };

  const fetchTableTypes = async () => {
    const { data } = await supabase.from('table_types').select('*').order('seats');
    if (data) setTableTypes(data);
  };

  const handleSave = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          preferences: editedProfile.preferences,
          preferred_area_id: editedProfile.preferred_area_id,
          preferred_table_type_id: editedProfile.preferred_table_type_id,
          special_dates: editedProfile.special_dates,
          communication_preferences: editedProfile.communication_preferences
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, profile_image: publicUrl } : null);
      setEditedProfile(prev => prev ? { ...prev, profile_image: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSpecialDateChange = (type: keyof SpecialDates, value: string) => {
    if (!editedProfile) return;

    setEditedProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        special_dates: {
          ...prev.special_dates,
          [type]: value
        }
      };
    });
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    if (!editedProfile) return;

    setEditedProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      };
    });
  };

  const handleCommunicationPreferenceChange = (key: string, value: boolean) => {
    if (!editedProfile) return;

    setEditedProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        communication_preferences: {
          ...prev.communication_preferences,
          [key]: value
        }
      };
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          navigate('/');
        }}
      />
    );
  }

  const containerClasses = theme === 'dark' 
    ? 'bg-gray-800/50' 
    : 'bg-white border border-gray-100';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Info Card */}
          <div className={`p-6 rounded-xl shadow-lg ${containerClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-lg transition ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                  title={isEditing ? 'Cancel editing' : 'Edit profile'}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <div className="relative">
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="profile-image"
                    className={`p-2 rounded-lg cursor-pointer transition ${
                      uploading
                        ? 'opacity-50'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`}
                    title="Upload profile photo"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-sf-gold"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                } flex items-center justify-center`}>
                  <span className="text-4xl text-gray-400">
                    {profile?.first_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.first_name || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev!, first_name: e.target.value }))}
                    className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                  />
                ) : (
                  <p>{profile?.first_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.last_name || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev!, last_name: e.target.value }))}
                    className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                  />
                ) : (
                  <p>{profile?.last_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile?.phone || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev!, phone: e.target.value }))}
                    className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                  />
                ) : (
                  <p>{profile?.phone || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <p>{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Loyalty & Stats Card */}
          <div className={`p-6 rounded-xl shadow-lg ${containerClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Loyalty & Status</h2>
              {profile?.vip_status && (
                <div className="flex items-center text-sf-gold">
                  <Crown className="h-5 w-5" />
                  <span className="ml-2">VIP Member</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center text-sf-gold mb-2">
                  <Star className="h-5 w-5" />
                  <span className="ml-2 font-medium">Loyalty Points</span>
                </div>
                <p className="text-2xl font-bold">{profile?.loyalty_points || 0}</p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center text-sf-gold mb-2">
                  <History className="h-5 w-5" />
                  <span className="ml-2 font-medium">Total Visits</span>
                </div>
                <p className="text-2xl font-bold">{profile?.visit_count || 0}</p>
              </div>
            </div>

            {profile?.last_visit && (
              <div className="mb-6">
                <p className="text-sm text-gray-400">Last Visit</p>
                <p>{format(new Date(profile.last_visit), 'MMMM d, yyyy')}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Special Dates</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Birthday</label>
                      <input
                        type="date"
                        value={editedProfile?.special_dates?.birthday || ''}
                        onChange={(e) => handleSpecialDateChange('birthday', e.target.value)}
                        className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Anniversary</label>
                      <input
                        type="date"
                        value={editedProfile?.special_dates?.anniversary || ''}
                        onChange={(e) => handleSpecialDateChange('anniversary', e.target.value)}
                        className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.special_dates?.birthday && (
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 text-sf-gold mr-2" />
                        <span>Birthday: {format(new Date(profile.special_dates.birthday), 'MMMM d')}</span>
                      </div>
                    )}
                    {profile?.special_dates?.anniversary && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-sf-gold mr-2" />
                        <span>Anniversary: {format(new Date(profile.special_dates.anniversary), 'MMMM d')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Dining Preferences</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <select
                      value={editedProfile?.preferred_area_id || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev!, preferred_area_id: e.target.value }))}
                      className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                    >
                      <option value="">Select preferred area</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>

                    <select
                      value={editedProfile?.preferred_table_type_id || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev!, preferred_table_type_id: e.target.value }))}
                      className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                    >
                      <option value="">Select preferred table type</option>
                      {tableTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name} ({type.seats} seats)</option>
                      ))}
                    </select>

                    <div>
                      <label className="text-sm text-gray-400">Seating Preference</label>
                      <select
                        value={editedProfile?.preferences?.seatingPreference || ''}
                        onChange={(e) => handlePreferenceChange('seatingPreference', e.target.value)}
                        className={`w-full p-2 rounded-lg border transition-colors ${inputClasses}`}
                      >
                        <option value="">No preference</option>
                        <option value="window">Window</option>
                        <option value="outdoor">Outdoor</option>
                        <option value="indoor">Indoor</option>
                        <option value="quiet">Quiet Area</option>
                        <option value="bar">Near Bar</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.preferred_area_id && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-sf-gold mr-2" />
                        <span>Preferred Area: {areas.find(a => a.id === profile.preferred_area_id)?.name}</span>
                      </div>
                    )}
                    {profile?.preferred_table_type_id && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-sf-gold mr-2" />
                        <span>Preferred Table: {tableTypes.find(t => t.id === profile.preferred_table_type_id)?.name}</span>
                      </div>
                    )}
                    {profile?.preferences?.seatingPreference && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-sf-gold mr-2" />
                        <span>Seating: {profile.preferences.seatingPreference}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Communication Preferences</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile?.communication_preferences?.email}
                        onChange={(e) => handleCommunicationPreferenceChange('email', e.target.checked)}
                        className="rounded border-gray-600 text-sf-gold focus:ring-sf-gold"
                      />
                      <span className="ml-2">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile?.communication_preferences?.sms}
                        onChange={(e) => handleCommunicationPreferenceChange('sms', e.target.checked)}
                        className="rounded border-gray-600 text-sf-gold focus:ring-sf-gold"
                      />
                      <span className="ml-2">SMS notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedProfile?.communication_preferences?.marketing}
                        onChange={(e) => handleCommunicationPreferenceChange('marketing', e.target.checked)}
                        className="rounded border-gray-600 text-sf-gold focus:ring-sf-gold"
                      />
                      <span className="ml-2">Marketing communications</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.communication_preferences && (
                      <>
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 text-sf-gold mr-2" />
                          <span>
                            Notifications: {[
                              profile.communication_preferences.email && 'Email',
                              profile.communication_preferences.sms && 'SMS'
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 text-sf-gold mr-2" />
                          <span>Marketing: {profile.communication_preferences.marketing ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2 bg-sf-gold text-sf-black rounded-lg hover:bg-sf-gold/90 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}