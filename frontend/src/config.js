const getBackendURL = () => {
  const currentURL = window.location.origin
  console.log('Current URL origin:', currentURL) 
  
  if (currentURL.includes('localhost')) {
    console.log('Detectado: LOCALHOST')
    return 'http://localhost:3000'
  } else if (currentURL.includes('onrender.com')) {
    console.log('Detectado: RENDER')
    return 'https://outfit-planner-m12p.onrender.com'
  } else {
    console.log('Fallback:', currentURL)
    return currentURL
  }
}

export const BACKEND_URL = getBackendURL()