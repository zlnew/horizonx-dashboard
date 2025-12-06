const useApp = () => {
  return {
    appURL: import.meta.env.VITE_APP_URL,
    apiURL: import.meta.env.VITE_API_URL,
  }
}

export default useApp
