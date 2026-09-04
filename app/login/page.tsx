'use client';

import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, DEMO_CREDENTIALS } from '@/lib/mock-api';
import { toast } from 'sonner';
import { Mail, Lock, ShieldCheck, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <Logo size="lg" className="text-primary-foreground [&_span]:text-primary-foreground" />
        </div>
        <div className="relative space-y-6">
          <ShieldCheck className="h-12 w-12 text-secondary" />
          <h2 className="text-3xl font-bold leading-tight">
            Scan. Inspect. Verify.
          </h2>
          <p className="text-primary-foreground/70 max-w-sm">
            AI-assisted packaged-commodity compliance inspection for food products.
            Verify mandatory declarations, detect violations, and generate reports.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-primary-foreground/60">Sample Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3,000+</p>
              <p className="text-sm text-primary-foreground/60">Simulated Checks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">20+</p>
              <p className="text-sm text-primary-foreground/60">Compliance Rules</p>
            </div>
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Inspector Foody. Prototype build.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the inspection workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="inspector@foody.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => toast.info('Password recovery is not available in the prototype.')}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      Demo Credentials
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email: <span className="font-mono">{DEMO_CREDENTIALS.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Password: <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
                    </p>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      Fill in demo credentials
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
