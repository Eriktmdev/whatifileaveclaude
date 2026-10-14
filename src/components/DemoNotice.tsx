export function DemoNotice({ what = 'Esta página' }: { what?: string }) {
  return (
    <div className="notice notice-demo" role="note">
      <p>
        <strong>Contenido de demostración.</strong> {what} usa datos de ejemplo para desarrollar la
        web. No están verificados y no deben usarse para tomar decisiones.
      </p>
    </div>
  )
}
