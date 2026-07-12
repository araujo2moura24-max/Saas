'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gauge,
  Zap,
  FileText,
  CalendarClock,
  ShieldCheck,
  Rocket,
  Tag,
  Copy,
  Check,
  TrendingDown,
  Sparkles,
  CircleDollarSign,
  BadgePercent,
  Layers,
} from 'lucide-react'

// ============================================================
// VALORES — edite aqui se precisar ajustar qualquer número
// ============================================================
const CLIENTE = 'Karen Fermino'
const MARCA = 'Drive Force'

// Débitos dos 2 contratos anteriores (valor bruto, sem juros/multas)
const DEBITO_ANTERIOR = 2283.0

// Nova landing page
const LP_VALOR_CHEIO = 1000.0
const LP_VALOR_FINAL = 700.0
const CUPOM = 'DRIVEFORCE2ANOS'

const DESCONTO = LP_VALOR_CHEIO - LP_VALOR_FINAL
const TOTAL = DEBITO_ANTERIOR + LP_VALOR_FINAL

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ============================================================
// Paleta Drive Force
// carbono: #0B0B10 | grafite: #14141C | laranja: #FF6B00
// âmbar: #FFB800 | vermelho: #FF3B30 | branco gelo: #F5F6FA
// ============================================================

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: 'easeOut' as const },
  }),
}

export default function KarenFerminoCobrancaPage() {
  const [copiado, setCopiado] = useState(false)

  const copiarCupom = async () => {
    try {
      await navigator.clipboard.writeText(CUPOM)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      // clipboard indisponível — mantém o cupom visível para cópia manual
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B10] text-[#F5F6FA] font-sans overflow-x-hidden">
      {/* linhas de velocidade / brilho de fundo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(60rem 30rem at 80% -10%, rgba(255,107,0,0.14), transparent 60%), radial-gradient(40rem 24rem at 0% 110%, rgba(255,184,0,0.08), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,246,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,246,250,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-5 py-12 sm:py-16">
        {/* ===================== HEADER / MARCA ===================== */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FFB800] shadow-[0_0_40px_rgba(255,107,0,0.45)]"
          >
            <Gauge className="h-8 w-8 text-[#0B0B10]" strokeWidth={2.4} />
          </motion.div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            DRIVE{' '}
            <span className="bg-gradient-to-r from-[#FF6B00] to-[#FFB800] bg-clip-text text-transparent">
              FORCE
            </span>
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-[#9A9AA6]">
            <Zap className="h-4 w-4 text-[#FFB800]" />
            <span>Resumo financeiro · {CLIENTE}</span>
          </div>

          <div className="mt-6 h-px w-full max-w-md bg-gradient-to-r from-transparent via-[#FF6B00]/60 to-transparent" />
        </motion.header>

        {/* ===================== TOTAL EM DESTAQUE ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-10"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[#FF6B00]/30 bg-[#14141C] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6B00] via-[#FFB800] to-[#FF6B00]"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9A9AA6]">
              Valor total
            </p>
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 120 }}
              className="mt-3 text-5xl font-black tracking-tight sm:text-6xl"
            >
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FFB800] bg-clip-text text-transparent">
                {brl(TOTAL)}
              </span>
            </motion.p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#9A9AA6]">
              Somatória dos débitos pendentes dos 2 contratos anteriores + nova
              landing page {MARCA} (já com cupom aplicado).
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A36] bg-[#0B0B10] px-4 py-2 text-xs text-[#9A9AA6]">
              <ShieldCheck className="h-4 w-4 text-[#FFB800]" />
              Valor bruto — sem juros, multas ou taxas por atraso
            </div>
          </div>
        </motion.section>

        {/* ===================== DETALHAMENTO ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-10"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#9A9AA6]">
            <Layers className="h-4 w-4 text-[#FF6B00]" />
            Detalhamento
          </h2>

          <div className="mt-4 grid gap-5">
            {/* ---- Débitos anteriores ---- */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group rounded-2xl border border-[#2A2A36] bg-[#14141C] p-6 transition-colors hover:border-[#FF6B00]/50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6B00]/15 transition-transform group-hover:scale-110">
                    <FileText className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h3 className="font-bold">Débitos pendentes</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#9A9AA6]">
                      Referente aos 2 contratos anteriores — serviços operados
                      ao longo dos meses.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0B0B10] px-2.5 py-1 text-[#9A9AA6]">
                        <CalendarClock className="h-3 w-3 text-[#FFB800]" />
                        Meses acumulados
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0B0B10] px-2.5 py-1 text-[#9A9AA6]">
                        <ShieldCheck className="h-3 w-3 text-[#FFB800]" />
                        Sem taxas de atraso
                      </span>
                    </div>
                  </div>
                </div>
                <p className="shrink-0 text-2xl font-black text-[#F5F6FA] sm:text-right">
                  {brl(DEBITO_ANTERIOR)}
                </p>
              </div>
            </motion.div>

            {/* ---- Nova landing page + cupom ---- */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group relative overflow-hidden rounded-2xl border border-[#FFB800]/30 bg-[#14141C] p-6 transition-colors hover:border-[#FFB800]/60"
            >
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FFB800]/10 opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFB800]/15 transition-transform group-hover:scale-110">
                    <Rocket className="h-5 w-5 text-[#FFB800]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">Nova landing page {MARCA}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FFB800] px-2.5 py-0.5 text-[11px] font-bold text-[#0B0B10]">
                        <Sparkles className="h-3 w-3" />
                        CUPOM APLICADO
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#9A9AA6]">
                      Desenvolvimento completo e personalizado, com desconto
                      exclusivo de parceria.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-sm text-[#9A9AA6] line-through decoration-[#FF3B30]/70">
                    {brl(LP_VALOR_CHEIO)}
                  </p>
                  <p className="text-2xl font-black text-[#FFB800]">
                    {brl(LP_VALOR_FINAL)}
                  </p>
                </div>
              </div>

              {/* cupom interativo */}
              <div className="relative mt-5 rounded-xl border border-dashed border-[#FFB800]/40 bg-[#0B0B10] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-[#FFB800]" />
                    <div>
                      <p className="font-mono text-lg font-bold tracking-widest text-[#F5F6FA]">
                        {CUPOM}
                      </p>
                      <p className="text-xs text-[#9A9AA6]">
                        Cupom de 2 anos {MARCA} · economia de{' '}
                        <span className="font-bold text-[#FFB800]">
                          {brl(DESCONTO)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={copiarCupom}
                    whileTap={{ scale: 0.94 }}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                      copiado
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : 'bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-[#0B0B10] hover:brightness-110'
                    }`}
                  >
                    {copiado ? (
                      <>
                        <Check className="h-4 w-4" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copiar cupom
                      </>
                    )}
                  </motion.button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#9A9AA6]">
                  <TrendingDown className="h-4 w-4 text-[#22C55E]" />
                  De {brl(LP_VALOR_CHEIO)} por {brl(LP_VALOR_FINAL)} — desconto
                  de 30% em comemoração aos 2 anos de {MARCA}.
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ===================== SOMATÓRIA ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-10"
        >
          <div className="rounded-2xl border border-[#2A2A36] bg-[#14141C] p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#9A9AA6]">
              <CircleDollarSign className="h-4 w-4 text-[#FF6B00]" />
              Somatória
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#9A9AA6]">
                  Débitos pendentes (2 contratos anteriores)
                </dt>
                <dd className="font-bold">{brl(DEBITO_ANTERIOR)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#9A9AA6]">Nova landing page {MARCA}</dt>
                <dd className="font-bold">{brl(LP_VALOR_CHEIO)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-[#22C55E]">
                  <BadgePercent className="h-4 w-4" />
                  Cupom {CUPOM}
                </dt>
                <dd className="font-bold text-[#22C55E]">- {brl(DESCONTO)}</dd>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-[#FF6B00]/50 to-transparent" />
              <div className="flex items-center justify-between gap-4 text-base">
                <dt className="font-black uppercase tracking-wide">Total</dt>
                <dd className="text-2xl font-black text-[#FFB800]">
                  {brl(TOTAL)}
                </dd>
              </div>
            </dl>
          </div>
        </motion.section>

        {/* ===================== RODAPÉ ===================== */}
        <motion.footer
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-12 text-center"
        >
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-[#9A9AA6]">
            Todos os valores acima correspondem ao valor bruto dos serviços
            prestados nos contratos anteriores e ao novo projeto, sem qualquer
            acréscimo de juros, multas ou taxas por atraso.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#3A3A46]">
            <Zap className="h-3.5 w-3.5" />
            Drive Force
          </div>
        </motion.footer>
      </div>
    </main>
  )
}
