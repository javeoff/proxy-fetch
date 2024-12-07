import { HttpsProxyAgent } from "https-proxy-agent"
import _fetch from 'node-fetch';

export class ProxyFetch {
	public URL: string = process.env.PROXIES_URL!;

	public constructor(private proxies?: string[]) {
		if (!proxies) {
			this.loadProxies();
		}
	}

	public async fetchProxies(options?: Record<string, any>): Promise<string[]> {
		return fetch(this.URL, options)
			.then(async (p) => {
				if (!p.ok) {
					const text = await p.text()
					throw new Error(`ProxyFetch failed: ${p.status} ${p.statusText} - ${text}`);
				}

				return p.text()
			})
			.then((r) => {
				const proxies = r.split('\n').filter((p) => !!p);

				if (proxies.some((p) => !p.includes('.'))) {
					throw new Error('ProxyFetch failed: Invalid proxy format. \n' + proxies.filter((p) => !p.includes('.')));
				}
				
				if (proxies.length === 0) {
					console.log('Proxy URL: ', process.env.PROXIES_URL!)
					console.log('Please, pass a valid proxy URL in PROXIES_URL environment variable')
					throw new Error('ProxyFetch failed: No proxies found');
				}

				return proxies;
			})
	}

	public async loadProxies(options?: Record<string, any>, force = false): Promise<string[]> {
		if (!force && this.proxies?.length) {
			return this.proxies;
		}

		const proxies = await this.fetchProxies(options)
		this.proxies = proxies;
		return proxies;
	}

	public async fetch(url: RequestInfo | URL, options?: Record<string, any>): Promise<any> {
		const proxy = this.getProxy()

		if (!proxy || !!this.URL) {
			throw new Error('ProxyFetch failed: Proxy not found');
		}

		return (_fetch as any)(url, {
			...options,
			proxy: proxy ? 'http://' + proxy : undefined,
			agent: new HttpsProxyAgent('http://' + proxy),
		})
	}

	private proxyIdx = 0;

	public getProxy() {
		if (!this.URL) {
			return;
		}
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

const proxyFetchInstance = new ProxyFetch([]);

export const loadProxies = (...args: Parameters<typeof proxyFetchInstance.loadProxies>) => proxyFetchInstance.loadProxies(...args);

export const proxyFetch = (...args: Parameters<typeof fetch>) => proxyFetchInstance.fetch(...args);
