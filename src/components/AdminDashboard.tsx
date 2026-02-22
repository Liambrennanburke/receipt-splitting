import { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  ChevronRight,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Receipt,
  Image,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface SessionSummary {
  id: string;
  created_at: string;
  restaurant_name: string | null;
  meal_date: string | null;
  grand_total: number;
  people: { name: string; color: string }[];
  split_mode: string;
}

interface SessionDetail {
  id: string;
  created_at: string;
  restaurant_name: string | null;
  meal_date: string | null;
  raw_ocr_text: string | null;
  receipt_image_url: string | null;
  items: { id: string; name: string; price: number; assignedTo: string[] }[];
  people: { id: string; name: string; color: string }[];
  tax: number;
  tip: number;
  split_mode: string;
  person_totals: {
    name: string;
    itemsTotal: number;
    taxShare: number;
    tipShare: number;
    total: number;
  }[];
  grand_total: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function LoginScreen({
  onLogin,
}: {
  onLogin: (password: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    onLogin(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-surface-900 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Admin Access</h1>
          <p className="text-sm text-surface-500 mt-1">
            Enter the admin password to view session data
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                placeholder="Enter admin password"
              />
              {error && (
                <p className="text-xs text-danger mt-1.5">
                  Invalid password. Try again.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-surface-900 text-white text-sm font-semibold rounded-lg hover:bg-surface-800 transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SessionList({
  sessions,
  onSelect,
  onRefresh,
  loading,
}: {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sessions</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {sessions.length} receipt{sessions.length !== 1 ? 's' : ''} split
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-12 text-center">
          <Receipt className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No sessions recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden divide-y divide-surface-100">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface-50/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 truncate">
                  {session.restaurant_name || 'Unnamed receipt'}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-surface-400">
                    {formatDate(session.created_at)}
                  </span>
                  {session.meal_date && (
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {session.meal_date}
                    </span>
                  )}
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.people?.length || 0}
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-surface-900 tabular-nums shrink-0">
                {formatCurrency(session.grand_total)}
              </span>
              <ChevronRight className="w-4 h-4 text-surface-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionDetailView({
  session,
  onBack,
}: {
  session: SessionDetail;
  onBack: () => void;
}) {
  const [showOcr, setShowOcr] = useState(false);
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sessions
      </button>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-primary-500 to-primary-600">
          {(session.restaurant_name || session.meal_date) && (
            <div className="flex items-center gap-4 mb-2">
              {session.restaurant_name && (
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="w-3.5 h-3.5" />
                  {session.restaurant_name}
                </span>
              )}
              {session.meal_date && (
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {session.meal_date}
                </span>
              )}
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Session Detail</h2>
              <span className="text-3xl font-bold text-white tabular-nums">
                {formatCurrency(session.grand_total)}
              </span>
            </div>
            <span className="text-xs text-primary-200">
              {formatDate(session.created_at)}
            </span>
          </div>
        </div>

        {session.person_totals && session.person_totals.length > 0 && (
          <div className="divide-y divide-surface-100">
            {session.person_totals.map((pt, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-surface-900">
                    {pt.name}
                  </p>
                  <p className="text-xs text-surface-400">
                    {formatCurrency(pt.itemsTotal)} items
                    {pt.taxShare > 0 && ` + ${formatCurrency(pt.taxShare)} tax`}
                    {pt.tipShare > 0 && ` + ${formatCurrency(pt.tipShare)} tip`}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums text-surface-900">
                  {formatCurrency(pt.total)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 space-y-1">
          <div className="flex justify-between text-sm text-surface-500">
            <span>Tax</span>
            <span className="tabular-nums">{formatCurrency(session.tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500">
            <span>Tip</span>
            <span className="tabular-nums">{formatCurrency(session.tip)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500">
            <span>Split mode</span>
            <span className="capitalize">{session.split_mode}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
            Items ({session.items.length})
          </h3>
        </div>
        <div className="divide-y divide-surface-100">
          {session.items.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-surface-700">{item.name}</span>
              <span className="text-sm font-medium tabular-nums text-surface-900">
                {formatCurrency(item.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {session.receipt_image_url && (
          <button
            onClick={() => setShowImage(!showImage)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Image className="w-4 h-4" />
            {showImage ? 'Hide' : 'View'} receipt image
          </button>
        )}
        {session.raw_ocr_text && (
          <button
            onClick={() => setShowOcr(!showOcr)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            {showOcr ? 'Hide' : 'View'} OCR text
          </button>
        )}
      </div>

      {showImage && session.receipt_image_url && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
          <img
            src={session.receipt_image_url}
            alt="Receipt"
            className="max-w-full rounded-lg mx-auto"
          />
        </div>
      )}

      {showOcr && session.raw_ocr_text && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-surface-900 mb-3">
            Raw OCR Output
          </h3>
          <pre className="text-xs text-surface-600 whitespace-pre-wrap font-mono bg-surface-50 rounded-lg p-4 max-h-80 overflow-auto">
            {session.raw_ocr_text}
          </pre>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [password, setPassword] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchSessions = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        headers: { 'X-Admin-Password': pw },
      });
      if (res.status === 401) {
        setAuthError(true);
        setPassword(null);
        return;
      }
      const data = await res.json();
      setSessions(data);
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = useCallback(
    async (id: string) => {
      if (!password) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/sessions/${id}`, {
          headers: { 'X-Admin-Password': password },
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedSession(data);
        }
      } catch {
        // network error
      } finally {
        setLoading(false);
      }
    },
    [password]
  );

  useEffect(() => {
    if (password) {
      fetchSessions(password);
    }
  }, [password, fetchSessions]);

  const handleLogin = (pw: string) => {
    setAuthError(false);
    setPassword(pw);
  };

  if (!password) {
    return (
      <div>
        <LoginScreen onLogin={handleLogin} />
        {authError && null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-surface-500" />
            <span className="text-sm font-semibold text-surface-900">
              Receipt Split Admin
            </span>
          </div>
          <button
            onClick={() => {
              setPassword(null);
              setSessions([]);
              setSelectedSession(null);
            }}
            className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8">
        {selectedSession ? (
          <SessionDetailView
            session={selectedSession}
            onBack={() => setSelectedSession(null)}
          />
        ) : (
          <SessionList
            sessions={sessions}
            onSelect={fetchSession}
            onRefresh={() => fetchSessions(password)}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}
