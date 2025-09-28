import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'manager' | 'employee' | 'viewer';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  avatar_url?: string;
}

interface User extends Profile {
  supabaseUser: SupabaseUser;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserProfile = async (session: Session) => {
      if (!mounted) return;
      
      console.log('Fetching profile for user:', session.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      console.log('Profile fetch result:', { profile, error });
      
      if (mounted && profile && !error) {
        setUser({
          ...profile,
          role: profile.role as UserRole,
          supabaseUser: session.user
        });
        console.log('User profile set successfully');
        setLoading(false);
      } else if (mounted && !profile && !error) {
        // Profile doesn't exist, create it
        console.log('Creating profile for user:', session.user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: session.user.id,
            name: session.user.user_metadata?.name || 'New User',
            email: session.user.email || '',
            role: 'employee'
          })
          .select()
          .single();
          
        if (newProfile && !createError) {
          setUser({
            ...newProfile,
            role: newProfile.role as UserRole,
            supabaseUser: session.user
          });
          console.log('New profile created and set');
        } else {
          console.error('Profile creation error:', createError);
        }
        setLoading(false);
      } else if (mounted && error) {
        console.error('Profile fetch error:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          fetchUserProfile(session);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name: name,
            email: email,
            role: 'employee'
          });
        
        if (profileError) {
          return { error: 'Account created but profile setup failed' };
        }
      }
      
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};