type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  mode: AuthMode;
  name: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

function AuthScreen({
  mode,
  name,
  email,
  password,
  loading,
  error,
  onModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthScreenProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Partnership CRM</p>
          <h1>Sign in to manage relationships, reminders, and pipeline activity.</h1>
          <p>
            Use the JWT auth flow to access the PostgreSQL-backed CRM. Admin users will be able to manage records, while standard users can
            collaborate inside the same workspace.
          </p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => onModeChange('login')}>
            Login
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => onModeChange('signup')}>
            Sign up
          </button>
        </div>

        <div className="auth-form">
          {mode === 'signup' ? (
            <label className="field-group">
              <span>Name</span>
              <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Ava Patel" />
            </label>
          ) : null}

          <label className="field-group">
            <span>Email</span>
            <input value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="ava@crm.com" />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="••••••••" />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="button" className="primary-button auth-submit" onClick={onSubmit} disabled={loading}>
            {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AuthScreen;
