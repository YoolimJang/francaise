// GitHub Pages는 정적 호스팅이라 `output: export`로 빌드한다.
// 프로젝트 페이지(umi-jang.github.io/francaise) 하위 경로를 위해
// PAGES=true일 때만 basePath를 붙인다(로컬 dev/build는 영향 없음).
const isPages = process.env.PAGES === "true";
const repo = "francaise";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : undefined,
  assetPrefix: isPages ? `/${repo}/` : undefined,
};
export default nextConfig;
