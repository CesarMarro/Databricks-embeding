'use client'

import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

export function SplineSceneBasic() {
  return (
    <div className="relative w-full h-full bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <div className="relative z-10 flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 w-max">
            Machine Learning para empresas
          </span>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 leading-tight">
            Modelos de ML aplicados al negocio
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl text-sm md:text-lg">
            Predicción de demanda, segmentación de clientes, detección de fraude y mantenimiento predictivo.
            Desplegamos prototipos rápidos que conectan con tus datos y muestran impacto real en semanas.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative min-h-[340px]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

      {/* Subtle gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(79,70,229,0.15),transparent_60%),radial-gradient(800px_circle_at_100%_0%,rgba(249,115,22,0.15),transparent_60%)]" />
    </div>
  );
}
