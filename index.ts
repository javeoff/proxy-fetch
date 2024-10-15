import { HttpsProxyAgent } from "https-proxy-agent"
import _fetch from 'node-fetch';

export class ProxyFetch {
	public constructor(private proxies?: string[]) {
		if (!proxies) {
			this.loadProxies();
		}
	}

	public async fetchProxies(options?: Record<string, any>): Promise<string[]> {
		return fetch(process.env.PROXIES_URL!, options)
			.then((p) => p.text())
			.then((r) => r.split('\n'))
	}

	public async loadProxies(options?: Record<string, any>) {
		this.proxies = await this.fetchProxies(options);
	}

	public async fetch(url: string, options?: Record<string, any>): Promise<any> {
		const proxy = this.getProxy()

		if (!proxy) {
			throw new Error('ProxyFetch failed: Proxy not found');
		}

		return (_fetch as any)(url, {
			...options,
			proxy,
			agent: new HttpsProxyAgent('http://' + proxy),
		})
	}

	private proxyIdx = 0;

	public getProxy() {
		if (!this.proxies) {
			throw new Error('Proxies does not loaded yet');
		}

		if (this.proxyIdx >= this.proxies.length) {
			this.proxyIdx = 0;
		}
		const p = this.proxies[this.proxyIdx]
		this.proxyIdx += 1;
		return p;
	}
}

export const proxyFetch = new ProxyFetch().fetch;
