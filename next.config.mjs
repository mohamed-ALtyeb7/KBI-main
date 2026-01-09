/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // مفيد للروابط والhosting
  images: {
    unoptimized: true, // لازم
  },
  // احذف الـ typescript.ignoreBuildErrors إلا لو ضروري مؤقت
  // احذف الـ headers كلها
  // لو عايز تغير اسم المجلد: distDir: 'dist',
};

export default nextConfig;
