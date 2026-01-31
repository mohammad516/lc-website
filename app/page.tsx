import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-4">
      <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Organic Logo"
            width={300}
            height={300}
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans text-center">
          Coming Soon
        </h1>
      </div>
    </main>
  );
}
