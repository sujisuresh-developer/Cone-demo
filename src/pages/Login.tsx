import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('clinicaone@gmail.com')
  const [password, setPassword] = useState('Clinicaone@123')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'login' | 'signin'>('login')
  const navigate = useNavigate()

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (email === 'clinicaone@gmail.com' && password === 'Clinicaone@123') {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf9f6] font-sans">
      {/* Top Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-[#0057FF]" />
          <span className="text-[22px] font-semibold text-[#0057FF]">ClinicOne</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded border border-[#0057FF] px-6 py-2 text-sm font-medium text-[#0057FF] transition-colors hover:bg-blue-50"
          >
            Log in
          </button>
          <button
            type="button"
            className="rounded bg-[#0057FF] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mt-[73px] flex h-[calc(100vh-73px)] w-full">
        {/* Left Panel */}
        <div className="flex w-1/2 flex-col items-center justify-start border-r border-gray-200 bg-white pt-16">
          <div className="text-center">
            <h1 className="text-[64px] font-bold leading-tight text-[#1C2A3A]">TEXT</h1>
            <h2 className="text-[32px] font-semibold text-[#1C2A3A]">Sub -Texts</h2>
          </div>
          <div className="mt-8 flex flex-1 items-end justify-center">
            <img
              src="/doctor_mascot.png"
              alt="Medical Team"
              className="max-h-[60vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = '/p.png'
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex w-1/2 flex-col items-center justify-center bg-[#faf9f6] px-16">
          <div className="w-full max-w-[420px]">
            <h3 className="mb-6 text-[18px] font-semibold text-gray-800">Authentication Form</h3>

            {/* Toggle Tabs */}
            <div className="mb-8 flex h-[46px] w-full overflow-hidden rounded-md border border-gray-300 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 text-[15px] font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'bg-[#0057FF] text-white'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 text-[15px] font-medium transition-colors ${
                  activeTab === 'signin'
                    ? 'bg-[#0057FF] text-white'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Sign in
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleContinue} className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-gray-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your mail ID"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-gray-800">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your Password"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[14px] outline-none placeholder:text-gray-400 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-[#0057FF] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Continue
              </button>

              {error && (
                <p className="mt-1 text-center text-[13px] font-medium text-red-500">{error}</p>
              )}
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-[13px] text-gray-400">Or</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            {/* SSO */}
            <button
              type="button"
              className="w-full rounded-md border border-[#0057FF] bg-white py-3 text-[15px] font-semibold text-[#0057FF] transition-colors hover:bg-blue-50"
            >
              Institution SSO
            </button>

            {/* Footer Links */}
            <div className="mt-10 text-center text-[13px] font-medium text-gray-400">
              <a href="#" className="hover:text-gray-600">Forgot password?</a>
              {' • '}
              <a href="#" className="hover:text-gray-600">Terms</a>
              {' • '}
              <a href="#" className="hover:text-gray-600">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
