"use client"
import React from 'react'
import { useSession } from 'next-auth/react'

function Page() {
  const { data: session, status } = useSession()

  React.useEffect(() => {
    console.log('Session details:', session)
  }, [session])

  if (status === 'loading') {
    return <p>Loading...</p>
  }

  if (!session) {
    return <p>You are not logged in.</p>
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <p>This is a protected route.</p>
      <p>You can add your dashboard content here.</p>
    </div>
  )
}

export default Page
