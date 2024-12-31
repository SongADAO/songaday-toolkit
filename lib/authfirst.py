import { validateToken } from './lib/youtube-auth'

// You can run this as a separate script
async function setupAuth() {
  const isValid = await validateToken()
  console.log('Auth setup:', isValid ? 'successful' : 'failed')
}

setupAuth()