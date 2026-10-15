import type { Field } from 'payload'

/**
 * Imagen servida desde /public/images (sin servicio de almacenamiento).
 * Toda imagen necesita texto alternativo y crédito/licencia: no se usan
 * fotos cuyo origen no podamos citar.
 */
export const imageField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  admin: {
    description:
      'Sube el archivo a public/images/ en el repositorio y escribe aquí su ruta. Si lo dejas vacío se muestra un fondo ilustrado.',
  },
  fields: [
    {
      name: 'src',
      label: 'Ruta',
      type: 'text',
      admin: { placeholder: '/images/australia/costa.jpg' },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (
          !/^\/images\/[a-z0-9/_\-.]+\.(jpe?g|png|webp|avif)$/i.test(value) ||
          value.includes('..')
        ) {
          return 'Debe ser una ruta dentro de /images/ terminada en .jpg, .png, .webp o .avif'
        }
        return true
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alt',
          label: 'Texto alternativo',
          type: 'text',
          admin: { width: '50%', description: 'Qué se ve en la imagen.' },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData: { src?: string } },
          ) =>
            siblingData?.src && !value ? 'Describe la imagen para quien no puede verla.' : true,
        },
        {
          name: 'credit',
          label: 'Crédito y licencia',
          type: 'text',
          admin: { width: '50%', placeholder: 'Foto: Nombre Apellido · Unsplash License' },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData: { src?: string } },
          ) => (siblingData?.src && !value ? 'Indica autoría y licencia de la imagen.' : true),
        },
      ],
    },
    { name: 'creditUrl', label: 'Enlace del crédito', type: 'text' },
  ],
})
