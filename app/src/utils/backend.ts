// API calls are same-origin everywhere: Caddy proxies /api in prod, Vite proxies it in dev
export const getBackendPath = (): string => '';

export const getAPIPath = (): string => {
	const backendPath = getBackendPath();
	return `${backendPath}/api`;
};
