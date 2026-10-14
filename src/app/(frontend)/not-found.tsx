import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container narrow section">
      <h1>No encontramos esta página</h1>
      <p className="lead">Puede que la guía se haya movido o que todavía no esté publicada.</p>
      <p>
        <Link className="button" href="/">
          Volver al inicio
        </Link>
      </p>
    </div>
  )
}
