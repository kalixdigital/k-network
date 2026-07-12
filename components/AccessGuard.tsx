// components/AccessGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { getLevel } from '@/lib/constants/levels';

interface AccessGuardProps {
  children: React.ReactNode;
  minLevel: number;
  redirectTo?: string;
}

export function AccessGuard({ children, minLevel, redirectTo = '/dashboard' }: AccessGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('membership_level')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const level = profile?.membership_level || 1;
        setUserLevel(level);
        setHasAccess(level >= minLevel);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, minLevel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    const levelData = getLevel(userLevel);
    const requiredLevelData = getLevel(minLevel);
    
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Lock className="h-12 w-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold">Access Restricted</h2>
              <p className="text-muted-foreground max-w-md">
                This feature is available to members at <strong>{requiredLevelData.name}</strong> level and above.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Your current level:</span>
                <span className={`font-semibold ${levelData.textColor}`}>
                  {levelData.name} (Level {userLevel})
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpCircle className="h-4 w-4" />
                <span>You need to reach Level {minLevel} to access this feature</span>
              </div>
              <Button 
                onClick={() => router.push(redirectTo)}
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}