import { HttpsProxyAgent } from "https-proxy-agent"
import _fetch from 'node-fetch';

let idx = 0;
let proxies: string[] = [];

async function loadProxies() {
  proxies = await fetch(process.env.PROXIES_URL!)
    .then((p) => p.text())
    .then((r) => r.split('\n'))
}

loadProxies()

const getProxy = () => {
  idx = (idx + 1) % proxies.length
  return proxies[idx]
}

const createProxyFetch = (timeout = 5000) => {
  const p: typeof fetch = async (url: URL | RequestInfo, options?: any): Promise<any> => {
    const controller = new AbortController();
    const proxy = getProxy()

    if (!proxy) {
      return p(url, options)
    }

    const t = setTimeout(() => controller.abort(), timeout)

    return _fetch(url as any, {
      ...options,
      agent: new HttpsProxyAgent('http://' + proxy),
      signal: controller.signal,
    }).then((res) => {
      clearTimeout(t)
      return res;
    })
  }
  return p
}

export const proxyFetch = createProxyFetch()
