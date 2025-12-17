const useApp = () => {
  function getWSUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host

    return `${protocol}//${host}/api/ws/user`
  }

  return {
    appURL: import.meta.env.VITE_APP_URL,
    wsURL: getWSUrl()
  }
}

export default useApp
