const config = {
  baseURL: process.env.SK7755_BASE_URL || 'https://utest.sk7755.com',
  agentId: process.env.SK7755_AGENT_ID || 'DDYL',
  get md5Key() {
    const key = process.env.SK7755_MD5KEY
    if (!key) {
      throw new Error('SK7755_MD5KEY environment variable is required')
    }
    return key
  },
}

export default config
