import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { loginSchema, type LoginFormValues } from '../schemas'

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      await signIn(values.username, values.password)
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-slate-900">Iniciar sesión</h1>

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          {...register('username')}
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-slate-900 underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
