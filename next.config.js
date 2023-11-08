const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    if (!process.env.CORE_SERVER) {
      console.error("CORE_SERVER 환경 변수가 설정되지 않았습니다.");
      throw new Error("CORE_SERVER 환경 변수가 설정되지 않았습니다.");
    }
    return [
      {
        source: "/cpp/:path*",
        destination: `${process.env.CORE_SERVER}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
