"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

// Primitivas de movimento do site. Regras: só transform/opacity/clip-path.
// IMPORTANTE (hidratação): o `initial` é SEMPRE o mesmo — o servidor não conhece a
// preferência de reduced-motion, então ramificar o `initial` por ela gera mismatch.
// Para quem pede menos movimento, só a DURAÇÃO cai a ~0 (o conteúdo aparece direto).

const once = { once: true, amount: 0.3 } as const;

function useDur(normal: number) {
  const reduce = useReducedMotion();
  return reduce ? 0.001 : normal;
}

/** Hairline da marca que se desenha da esquerda para a direita. */
export function RuleDraw({ delay = 0, className = "bg-royal-ink/20" }: { delay?: number; className?: string }) {
  const duration = useDur(0.9);
  return (
    <motion.span
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 block h-px origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={once}
      transition={{ duration, delay, ease: EASE_OUT }}
    />
  );
}

/** Item de lista: a linha do topo se desenha e o conteúdo aparece logo depois (atraso total limitado). */
export function RowReveal({
  index,
  children,
  className,
  ruleClassName,
}: {
  index: number;
  children: ReactNode;
  className?: string;
  ruleClassName?: string;
}) {
  const duration = useDur(0.6);
  const delay = Math.min(index, 6) * 0.06;
  return (
    <li className={`relative ${className ?? ""}`}>
      <RuleDraw delay={delay} className={ruleClassName} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={once}
        transition={{ duration, delay: delay + 0.15, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </li>
  );
}

/**
 * No celular, rolar a página vertical "arrasta" as fotos na horizontal — a
 * faixa de fotos fixa na tela até a última imagem passar, só então o scroll
 * volta ao normal. Pensado pra telas estreitas onde fotos lado a lado ficam
 * pequenas demais (ver Serviços); em desktop não é usado (`md:hidden` no
 * componente que chama). Pontinhos embaixo indicam quantas fotos tem e qual
 * está em foco — sem eles o gesto fica confuso (câmbio brusco sem contexto).
 * Com `prefers-reduced-motion`, cai pra uma rolagem horizontal comum
 * (overflow-x), sem prender a página.
 */
export function StickyHorizontalPhotos({
  photos,
}: {
  photos: { src: string; alt: string; label?: string }[];
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(photos.length - 1) * 100}%`]);

  if (reduce) {
    return (
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {photos.map((photo) => (
          <div key={photo.src} className="relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden">
            <Image src={photo.src} alt={photo.alt} fill sizes="78vw" className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `${100 + (photos.length - 1) * 70}vh` }} className="relative">
      <div className="sticky top-16 h-[68vh] w-full overflow-hidden">
        <motion.div className="flex h-full" style={{ x }}>
          {photos.map((photo) => (
            <div key={photo.src} className="relative h-full w-full shrink-0">
              <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" />
              {photo.label && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-4 pt-10 pb-4">
                  <span className="font-heading text-xl text-white">{photo.label}</span>
                </div>
              )}
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-x-0 bottom-20 flex justify-center gap-1.5">
          {photos.map((photo, i) => (
            <Dot key={photo.src} index={i} total={photos.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Dot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, (start + end) / 2, end], [0.35, 1, 0.35]);
  return <motion.span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white" style={{ opacity }} />;
}

/** Abre o retrato como uma íris (formato do medalhão). */
export function IrisReveal({
  index,
  children,
  className,
  style,
}: {
  index: number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const duration = useDur(0.9);
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
      whileInView={{ opacity: 1, clipPath: "circle(75% at 50% 50%)" }}
      viewport={once}
      transition={{ duration, delay: Math.min(index, 4) * 0.1, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
