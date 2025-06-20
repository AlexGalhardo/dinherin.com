/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	experimental: {
		nextScriptWorkers: false
	},
};

export default nextConfig;
