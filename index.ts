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
  const p = async (url: URL | RequestInfo, options?: any, repeat = 0): Promise<any> => {
    const controller = new AbortController();
    const proxy = getProxy()

    if (!proxy && repeat > 3) {
      throw new Error('proxy fetch failed');
    }
    if (!proxy) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return p(url, options, repeat + 1);
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

const proxyFetch = createProxyFetch()

export default proxyFetch;
