import { useState, type FormEvent } from 'react'
import { errorMessage } from '@/lib/errors'
import { fieldErrors } from '@/lib/validation'

import { signIn, signUp } from '../../api/auth.api'
import { credentialsSchema } from '../../schemas'

export type AuthMode = 'sign-in' | 'sign-up'

type FieldErrors = Partial<Record<'email' | 'password', string>>

export function useAuthForm(mode: AuthMode) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const parsed = credentialsSchema.safeParse({ email: email.trim(), password })
    if (!parsed.success) {
      setErrors(fieldErrors<'email' | 'password'>(parsed.error))
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signIn(parsed.data)
      } else {
        const { needsConfirmation } = await signUp(parsed.data)
        if (needsConfirmation) {
          setNotice(
            `We sent a confirmation link to ${parsed.data.email}. Open it to finish signing up.`,
          )
        }
      }
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    formError,
    notice,
    submitting,
    onSubmit,
  }
}
