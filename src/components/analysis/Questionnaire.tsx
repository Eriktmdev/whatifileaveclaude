'use client'

import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Knowledge } from '@/lib/freeResult'
import { PASSPORTS } from '@/lib/passports'
import {
  DEMO_PROFILE,
  DURATIONS,
  EDUCATION_LEVELS,
  ENGLISH_LEVELS,
  EXPERIENCE,
  GOALS,
  PREP_TIMES,
  type Profile,
  REMOTE_WILLINGNESS,
  YES_NO_UNKNOWN,
  labelOf,
} from '@/lib/profile'
import { SECTORS, sectorLabel } from '@/lib/sectors'

import { Choices, MultiChoices, Question } from './fields'
import { useStoredProfile } from './useStoredProfile'

const PASSPORT_OPTIONS = [...PASSPORTS, { value: 'other', label: 'Otro' }] as const
const RESIDENCE_OPTIONS = [
  { value: 'ES', label: 'España' },
  { value: 'other', label: 'Otro país' },
] as const

type StepId =
  'you' | 'education' | 'work' | 'money' | 'goals' | 'preferences' | 'checks' | 'summary'

const STEPS: { id: StepId; title: string; intro: string }[] = [
  { id: 'you', title: 'Sobre ti', intro: 'Lo básico para saber qué vías pueden aplicarte.' },
  {
    id: 'education',
    title: 'Formación e idiomas',
    intro: 'Algunas vías piden un nivel de estudios o de inglés.',
  },
  {
    id: 'work',
    title: 'Tu experiencia',
    intro: 'Para encontrar oportunidades cercanas a lo que ya sabes hacer.',
  },
  { id: 'money', title: 'Tu colchón económico', intro: 'Algunas vías piden demostrar fondos.' },
  { id: 'goals', title: 'Qué buscas', intro: 'Así ordenamos lo que te mostramos.' },
  {
    id: 'preferences',
    title: 'Preferencias',
    intro: 'Dónde y cómo estarías dispuesto o dispuesta a trabajar.',
  },
  {
    id: 'checks',
    title: 'Comprobaciones rápidas',
    intro: 'Requisitos que solo tú puedes confirmar.',
  },
  {
    id: 'summary',
    title: 'Revisa tus respuestas',
    intro: 'Puedes cambiar cualquier cosa antes de ver el resultado.',
  },
]

export function Questionnaire({ knowledge }: { knowledge: Knowledge }) {
  const router = useRouter()
  const { profile, save, clear, loaded } = useStoredProfile()
  const [stepIndex, setStepIndex] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const passportCovered =
    !profile.passport ||
    profile.passport === 'other' ||
    knowledge.pathways.some(
      (p) => !p.eligiblePassports.length || p.eligiblePassports.includes(profile.passport!),
    )
  const selfChecks =
    profile.passport && profile.passport !== 'other'
      ? knowledge.pathways
          .filter((p) => p.eligiblePassports.includes(profile.passport!))
          .flatMap((p) =>
            p.requirements.filter((r) => r.rule.mode === 'self_declared').map((r) => ({ r, p })),
          )
      : []
  const steps = STEPS.filter((s) => s.id !== 'checks' || selfChecks.length > 0)
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const isLast = step.id === 'summary'

  // Al cambiar de paso, mover el foco al título (teclado y lectores de pantalla).
  useEffect(() => {
    headingRef.current?.focus()
  }, [stepIndex])

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    save({ ...profile, [key]: value })
  const goTo = (id: StepId) =>
    setStepIndex(
      Math.max(
        0,
        steps.findIndex((s) => s.id === id),
      ),
    )

  if (!loaded) return <p className="muted">Cargando…</p>

  return (
    <div className="wizard">
      <div className="progress" aria-hidden="true">
        <div
          className="progress-bar"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
      <p className="muted small" aria-live="polite">
        Paso {stepIndex + 1} de {steps.length}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="wizard-title">
        {step.title}
      </h2>
      <p className="muted">{step.intro}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (isLast) router.push('/analisis/resultado')
          else setStepIndex(stepIndex + 1)
        }}
      >
        {step.id === 'you' ? (
          <>
            <Question
              label="¿Qué edad tienes?"
              why="Algunas vías tienen límites de edad. Puedes dejarlo vacío si prefieres no decirlo."
            >
              {({ inputId, hintId }) => (
                <input
                  id={inputId}
                  aria-describedby={hintId}
                  className="input input-short"
                  type="number"
                  inputMode="numeric"
                  min={14}
                  max={99}
                  value={profile.age ?? ''}
                  onChange={(e) => {
                    const n = e.target.value === '' ? null : Number(e.target.value)
                    set(
                      'age',
                      n !== null && Number.isFinite(n) && n >= 14 && n <= 99 ? Math.round(n) : null,
                    )
                  }}
                />
              )}
            </Question>
            <Question
              as="fieldset"
              label="¿De qué país es tu pasaporte?"
              why="Los requisitos dependen de la nacionalidad del pasaporte, no de dónde vives."
            >
              {() => (
                <Choices
                  name="passport"
                  options={PASSPORT_OPTIONS}
                  value={profile.passport}
                  onChange={(v) => set('passport', v)}
                />
              )}
            </Question>
            {!passportCovered || profile.passport === 'other' ? (
              <div className="notice notice-info" role="note">
                <p>
                  Por ahora nuestro recorrido está preparado para pasaporte español. Puedes seguir,
                  pero la evaluación de requisitos no se aplicará a tu caso.
                </p>
              </div>
            ) : null}
            <Question
              as="fieldset"
              label="¿Dónde vives ahora?"
              why="Puede influir en trámites como certificados o la presentación de la solicitud."
            >
              {() => (
                <Choices
                  name="residence"
                  options={RESIDENCE_OPTIONS}
                  value={profile.residence}
                  onChange={(v) => set('residence', v)}
                />
              )}
            </Question>
            <Question
              as="fieldset"
              label="¿Viajarías con hijos o hijas a cargo?"
              why="Algunas vías no permiten llevar personas dependientes."
            >
              {() => (
                <Choices
                  name="kids"
                  options={YES_NO_UNKNOWN}
                  value={profile.dependentChildren}
                  onChange={(v) => set('dependentChildren', v)}
                />
              )}
            </Question>
          </>
        ) : null}

        {step.id === 'education' ? (
          <>
            <Question
              as="fieldset"
              label="¿Cuál es tu nivel de estudios más alto?"
              why="Algunas vías exigen un nivel mínimo de estudios."
            >
              {() => (
                <Choices
                  name="edu"
                  options={EDUCATION_LEVELS}
                  value={profile.education}
                  onChange={(v) => set('education', v)}
                />
              )}
            </Question>
            <Question
              label="¿De qué? (opcional)"
              why="Nos ayuda a encontrar oportunidades relacionadas."
            >
              {({ inputId, hintId }) => (
                <input
                  id={inputId}
                  aria-describedby={hintId}
                  className="input"
                  maxLength={120}
                  placeholder="Ej.: Sistemas microinformáticos y redes"
                  value={profile.studyField ?? ''}
                  onChange={(e) => set('studyField', e.target.value || undefined)}
                />
              )}
            </Question>
            <Question
              as="fieldset"
              label="¿Qué nivel de inglés tienes?"
              why="Afecta a los requisitos de idioma y a los trabajos a los que puedes acceder."
            >
              {() => (
                <Choices
                  name="english"
                  options={ENGLISH_LEVELS}
                  value={profile.english}
                  onChange={(v) => set('english', v)}
                />
              )}
            </Question>
            <Question as="fieldset" label="¿Tienes un certificado oficial de inglés?">
              {() => (
                <Choices
                  name="cert"
                  options={YES_NO_UNKNOWN}
                  value={profile.englishCertificate}
                  onChange={(v) => set('englishCertificate', v)}
                />
              )}
            </Question>
          </>
        ) : null}

        {step.id === 'work' ? (
          <>
            <Question
              label="¿En qué sector trabajas o has trabajado más?"
              why="Para buscar oportunidades en tu sector y en sectores cercanos."
            >
              {({ inputId, hintId }) => (
                <select
                  id={inputId}
                  aria-describedby={hintId}
                  className="input"
                  value={profile.sector ?? ''}
                  onChange={(e) =>
                    set('sector', (e.target.value || undefined) as Profile['sector'])
                  }
                >
                  <option value="">Elige uno</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </Question>
            <Question label="¿Cuál es tu profesión o puesto? (opcional)">
              {({ inputId }) => (
                <input
                  id={inputId}
                  className="input"
                  maxLength={120}
                  placeholder="Ej.: Técnico de soporte"
                  value={profile.profession ?? ''}
                  onChange={(e) => set('profession', e.target.value || undefined)}
                />
              )}
            </Question>
            <Question as="fieldset" label="¿Cuánta experiencia laboral tienes?">
              {() => (
                <Choices
                  name="exp"
                  options={EXPERIENCE}
                  value={profile.experience}
                  onChange={(v) => set('experience', v)}
                />
              )}
            </Question>
            <Question
              label="¿Qué sabes hacer? (opcional)"
              why="Escribe tus tareas o competencias separadas por comas. Así detectamos oportunidades que quizá no conocías."
            >
              {({ inputId, hintId }) => (
                <textarea
                  id={inputId}
                  aria-describedby={hintId}
                  className="input"
                  rows={3}
                  maxLength={400}
                  placeholder="Ej.: soporte técnico, redes, integraciones"
                  value={profile.skills ?? ''}
                  onChange={(e) => set('skills', e.target.value || undefined)}
                />
              )}
            </Question>
          </>
        ) : null}

        {step.id === 'money' ? (
          <>
            <Question
              label="¿Cuánto tienes ahorrado para el viaje? (en euros)"
              why="Algunas vías piden demostrar fondos. Solo lo comparamos si tenemos un tipo de cambio con fuente."
            >
              {({ inputId, hintId }) => (
                <input
                  id={inputId}
                  aria-describedby={hintId}
                  className="input input-short"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={profile.savingsEur ?? ''}
                  onChange={(e) => {
                    const n = e.target.value === '' ? null : Number(e.target.value)
                    set('savingsEur', n !== null && Number.isFinite(n) && n >= 0 ? n : null)
                  }}
                />
              )}
            </Question>
            <p className="muted small">
              Si no lo sabes o prefieres no decirlo, déjalo vacío. Lo marcaremos como «falta
              comprobar».
            </p>
          </>
        ) : null}

        {step.id === 'goals' ? (
          <>
            <Question as="fieldset" label="¿Qué quieres conseguir? Elige todas las que quieras.">
              {() => (
                <MultiChoices
                  options={GOALS}
                  value={profile.goals}
                  onChange={(v) => set('goals', v)}
                />
              )}
            </Question>
            <Question as="fieldset" label="¿Cuánto tiempo te gustaría estar?">
              {() => (
                <Choices
                  name="duration"
                  options={DURATIONS}
                  value={profile.duration}
                  onChange={(v) => set('duration', v)}
                />
              )}
            </Question>
            <Question as="fieldset" label="¿Cuánto tiempo tienes para prepararte?">
              {() => (
                <Choices
                  name="prep"
                  options={PREP_TIMES}
                  value={profile.prepTime}
                  onChange={(v) => set('prepTime', v)}
                />
              )}
            </Question>
          </>
        ) : null}

        {step.id === 'preferences' ? (
          <>
            <Question
              as="fieldset"
              label="¿Trabajarías en zonas regionales o remotas?"
              why="Muchas oportunidades bien pagadas están lejos de las ciudades, con sus pros y contras."
            >
              {() => (
                <Choices
                  name="remote"
                  options={REMOTE_WILLINGNESS}
                  value={profile.remoteOk}
                  onChange={(v) => set('remoteOk', v)}
                />
              )}
            </Question>
            <Question as="fieldset" label="¿Qué sectores te interesan? (opcional)">
              {() => (
                <MultiChoices
                  options={SECTORS}
                  value={profile.sectorsOfInterest}
                  onChange={(v) => set('sectorsOfInterest', v)}
                />
              )}
            </Question>
          </>
        ) : null}

        {step.id === 'checks' ? (
          <>
            {selfChecks.map(({ r }) => (
              <Question
                key={r.id}
                as="fieldset"
                label={r.rule.question || r.statement}
                why={r.statement}
              >
                {() => (
                  <Choices
                    name={`check-${r.id}`}
                    options={YES_NO_UNKNOWN}
                    value={profile.checks?.[r.id]}
                    onChange={(v) => set('checks', { ...(profile.checks ?? {}), [r.id]: v })}
                  />
                )}
              </Question>
            ))}
          </>
        ) : null}

        {step.id === 'summary' ? <Summary profile={profile} onEdit={goTo} /> : null}

        <div className="wizard-nav">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="button-ghost"
              onClick={() => setStepIndex(stepIndex - 1)}
            >
              <ArrowLeft size={18} aria-hidden="true" /> Atrás
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="button">
            {isLast ? 'Ver mi resultado' : 'Siguiente'} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="wizard-footer small muted">
        <p>
          Tus respuestas se guardan solo en este navegador. No las enviamos a ningún servidor.{' '}
          <button type="button" className="link-button" onClick={() => (clear(), setStepIndex(0))}>
            Borrar mis respuestas
          </button>
        </p>
        <p>
          ¿Solo quieres ver cómo funciona?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              save(DEMO_PROFILE)
              router.push('/analisis/resultado')
            }}
          >
            Usar un perfil de ejemplo (ficticio)
          </button>
        </p>
      </div>
    </div>
  )
}

function Summary({ profile: p, onEdit }: { profile: Profile; onEdit: (id: StepId) => void }) {
  const rows: { step: StepId; label: string; value: string | undefined }[] = [
    { step: 'you', label: 'Edad', value: p.age != null ? `${p.age} años` : undefined },
    { step: 'you', label: 'Pasaporte', value: labelOf(PASSPORT_OPTIONS, p.passport) },
    { step: 'you', label: 'Residencia', value: labelOf(RESIDENCE_OPTIONS, p.residence) },
    { step: 'you', label: 'Hijos a cargo', value: labelOf(YES_NO_UNKNOWN, p.dependentChildren) },
    { step: 'education', label: 'Estudios', value: labelOf(EDUCATION_LEVELS, p.education) },
    { step: 'education', label: 'Inglés', value: labelOf(ENGLISH_LEVELS, p.english) },
    { step: 'work', label: 'Sector', value: p.sector ? sectorLabel(p.sector) : undefined },
    { step: 'work', label: 'Profesión', value: p.profession },
    { step: 'work', label: 'Experiencia', value: labelOf(EXPERIENCE, p.experience) },
    {
      step: 'money',
      label: 'Ahorros',
      value:
        p.savingsEur != null
          ? `${new Intl.NumberFormat('es-ES').format(p.savingsEur)} €`
          : undefined,
    },
    {
      step: 'goals',
      label: 'Objetivos',
      value: p.goals?.map((g) => labelOf(GOALS, g)).join(', ') || undefined,
    },
    { step: 'goals', label: 'Duración', value: labelOf(DURATIONS, p.duration) },
    { step: 'preferences', label: 'Zonas remotas', value: labelOf(REMOTE_WILLINGNESS, p.remoteOk) },
  ]
  return (
    <dl className="summary-list">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.value ?? <span className="muted">Sin responder</span>}
            <button
              type="button"
              className="link-button"
              onClick={() => onEdit(r.step)}
              aria-label={`Editar ${r.label}`}
            >
              <Pencil size={14} aria-hidden="true" /> Editar
            </button>
          </dd>
        </div>
      ))}
      <p className="muted small" style={{ marginTop: '1rem' }}>
        Puedes dejar preguntas sin responder: el resultado indicará qué falta comprobar.{' '}
        <Link href="/australia">Volver a Australia</Link>
      </p>
    </dl>
  )
}
