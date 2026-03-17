/// <reference types="vite/client" />
// Allow importing media files (including uppercase extensions) and `?url` imports used by Vite
declare module "*?url" {
	const src: string;
	export default src;
}

declare module "*.mov" {
	const src: string;
	export default src;
}
declare module "*.MOV" {
	const src: string;
	export default src;
}

declare module "*.mp4" {
	const src: string;
	export default src;
}
declare module "*.webm" {
	const src: string;
	export default src;
}
