import { Link } from 'react-router'

import { Button, TextField } from '@/components/ui'

import { useAuthForm, type AuthMode } from './useAuthForm'

const copy: Record<
  AuthMode,
  { title: string; submit: string; switchText: string; switchLink: string; switchTo: string }
> = {
  'sign-in': {
    title: 'Sign in',
    submit: 'Sign in',
    switchText: 'New here?',
    switchLink: 'Create an account',
    switchTo: '/signup',
  },
  'sign-up': {
    title: 'Create account',
    submit: 'Create account',
    switchText: 'Already have an account?',
    switchLink: 'Sign in',
    switchTo: '/login',
  },
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const form = useAuthForm(mode)
  const text = copy[mode]

  if (form.notice) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Check your email</h1>
        <p className="text-muted text-[15px]">{form.notice}</p>
        <Link to="/login" className="text-accent font-medium">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">{text.title}</h1>
      <div className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={form.setEmail}
          error={form.errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          value={form.password}
          onChange={form.setPassword}
          error={form.errors.password}
          hint={mode === 'sign-up' ? 'At least 8 characters.' : undefined}
        />
      </div>
      {form.formError && (
        <p role="alert" className="text-negative text-sm">
          {form.formError}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={form.submitting}>
        {form.submitting ? 'Please wait…' : text.submit}
      </Button>
      <p className="text-muted text-center text-sm">
        {text.switchText}{' '}
        <Link to={text.switchTo} className="text-accent font-medium">
          {text.switchLink}
        </Link>
      </p>
    </form>
  )
}
