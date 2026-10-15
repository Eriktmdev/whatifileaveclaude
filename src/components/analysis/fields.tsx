'use client'

import React, { useId } from 'react'

/** Piezas de formulario accesibles: etiqueta, ayuda («por qué lo preguntamos») y opciones grandes. */

export function Question({
  label,
  why,
  children,
  as = 'div',
}: {
  label: string
  why?: string
  children: (ids: { inputId: string; hintId?: string }) => React.ReactNode
  as?: 'div' | 'fieldset'
}) {
  const inputId = useId()
  const hintId = why ? `${inputId}-why` : undefined
  if (as === 'fieldset') {
    return (
      <fieldset className="q" aria-describedby={hintId}>
        <legend className="q-label">{label}</legend>
        {why ? (
          <p className="q-why" id={hintId}>
            {why}
          </p>
        ) : null}
        {children({ inputId, hintId })}
      </fieldset>
    )
  }
  return (
    <div className="q">
      <label className="q-label" htmlFor={inputId}>
        {label}
      </label>
      {why ? (
        <p className="q-why" id={hintId}>
          {why}
        </p>
      ) : null}
      {children({ inputId, hintId })}
    </div>
  )
}

export function Choices<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: readonly { value: T; label: string }[]
  value: T | undefined
  onChange: (v: T) => void
}) {
  return (
    <div className="choices" role="radiogroup">
      {options.map((o) => (
        <label key={o.value} className={`choice${value === o.value ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

export function MultiChoices<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[]
  value: T[] | undefined
  onChange: (v: T[]) => void
}) {
  const selected = new Set(value ?? [])
  return (
    <div className="choices">
      {options.map((o) => (
        <label key={o.value} className={`choice${selected.has(o.value) ? ' is-selected' : ''}`}>
          <input
            type="checkbox"
            value={o.value}
            checked={selected.has(o.value)}
            onChange={(e) => {
              const next = new Set(selected)
              if (e.target.checked) next.add(o.value)
              else next.delete(o.value)
              onChange([...next])
            }}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}
