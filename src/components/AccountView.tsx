import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, SignOut, Envelope, Calendar } from '@phosphor-icons/react';

export function AccountView() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Not logged in</p>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="space-y-8">
          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 rounded-lg bg-primary/10">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 rounded-lg bg-primary/10">
                  <Envelope size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 rounded-lg bg-primary/10">
                  <Calendar size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                  <p className="text-lg font-semibold">{joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Logging out will sign you out of this account. You can log back in anytime with your credentials.
            </p>
            <Button
              variant="destructive"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <SignOut size={18} />
              Log Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Section */}
      <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-4">
          <div className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
            <span className="text-lg font-bold">ℹ</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Data Privacy</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your workout data is stored securely and is only accessible to your account. Each user has completely isolated data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
