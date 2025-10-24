'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plane } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">Atlas Escape</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/plan"
              className={`font-medium transition-colors ${
                isActive('/plan')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Plan Trip
            </Link>

            {user ? (
              <>
                <Link
                  href="/trips"
                  className={`font-medium transition-colors ${
                    isActive('/trips')
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  My Trips
                </Link>
                <button
                  onClick={logout}
                  className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-medium transition-colors ${
                    isActive('/login')
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

