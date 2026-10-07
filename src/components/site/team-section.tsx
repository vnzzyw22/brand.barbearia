"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import type { Staff } from "@/lib/supabase/types";

interface TeamSectionProps {
  staff: Staff[];
}

// Ícone de perfil genérico (cabeça + ombros) — o mesmo tipo de placeholder
// que WhatsApp/Google usam quando não há foto: sinaliza "sem foto" de
// forma universal, sem tentar parecer decoração da marca.
function PersonPlaceholder({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="38" r="18" />
      <path d="M50 60c-24 0-38 14-38 32v8h76v-8c0-18-14-32-38-32Z" />
    </svg>
  );
}

// Retratos em moldura circular. Sem foto real, o slot mostra um ícone de
// perfil genérico — placeholder explícito, nunca foto de banco. Fotos reais
// entram sem filtro. Entrada por fade simples (não por scroll): a versão
// anterior usava revelação por clip-path disparada só quando o elemento
// entrava na viewport, e em alguns layouts isso nunca disparava — o
// retrato ficava clipado em 0% pra sempre (invisível). Fade garantido no
// mount é mais seguro que uma animação que pode nunca disparar.
export function TeamSection({ staff }: TeamSectionProps) {
  const reduce = useReducedMotion();
  if (staff.length === 0) return null;

  return (
    <section id="equipe" className="on-paper bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="font-display text-[3rem] leading-[0.95] text-royal-ink sm:text-7xl">
            Escolha quem atende
          </h2>
          <p className="max-w-xs leading-relaxed text-ink/60">
            Cada barbeiro tem a própria agenda. Reserve direto com quem você prefere.
          </p>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-14 md:mt-20 md:gap-x-16">
          {staff.map((person, i) => (
            <li
              key={person.id}
              className={`w-[calc(50%-1.25rem)] sm:w-[220px] md:w-[240px] ${i % 2 === 1 ? "md:mt-14" : ""}`}
            >
              <motion.div
                className="relative mx-auto aspect-square w-full"
                style={{ ["--medallion-gap" as string]: "var(--paper)" }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0.001 : 0.5, delay: Math.min(i, 4) * 0.08, ease: EASE_OUT }}
              >
                <div className="medallion absolute inset-0 overflow-hidden text-royal-ink">
                  {person.photo_url ? (
                    <Image src={person.photo_url} alt={person.name} fill sizes="240px" className="object-cover" />
                  ) : (
                    <div
                      role="img"
                      aria-label={`Espaço reservado para foto de ${person.name}`}
                      className="relative flex h-full w-full items-center justify-center bg-steel"
                    >
                      <PersonPlaceholder className="h-[55%] w-[55%] text-white/25" />
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="mt-7">
                <h3 className="font-heading text-[2.1rem] leading-none text-ink">
                  {person.name}
                </h3>
                {person.role && <p className="meta mt-1 text-ink/60">{person.role}</p>}
                <Link
                  href={`/agendar?profissional=${person.id}`}
                  aria-label={`Reservar com ${person.name}`}
                  className="group relative mt-4 inline-block py-2 font-semibold text-royal-ink"
                >
                  Reservar com {person.name.split(" ")[0]}
                  <span className="absolute inset-x-0 bottom-0.5 h-px bg-royal-ink transition-transform duration-500 ease-[var(--ease-signature)] group-hover:origin-right group-hover:scale-x-0" />
                </Link>
                {person.instagram && (
                  <a
                    href={`https://instagram.com/${person.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta ml-5 text-ink/60 transition-colors hover:text-royal-ink"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
