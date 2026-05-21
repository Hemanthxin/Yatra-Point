import Image from "next/image";

// Hero background. Uses a portrait-oriented crop on small screens and a
// wide landscape crop on md+ so the composition stays readable in both
// orientations. Drop the two source files into /public:
//   public/hero-landscape.jpg  (wide; used on md+)
//   public/hero-portrait.jpg   (tall;  used on small screens)
export function BackgroundScene() {
  return (
    <div className="absolute inset-0 -z-0 overflow-hidden">
      {/* Mobile / narrow viewports */}
      <Image
        src="/66245.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:hidden"
      />
      {/* Tablet and desktop */}
      <Image
        src="/66242.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />
      {/* Dark overlay so the white login card and headline stay readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
    </div>
  );
}
