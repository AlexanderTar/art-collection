import { Typography } from '@/common/components'
import { cn } from '@/common/styleUtils'
import { Certificate } from '@/client/model/certificate'

interface CertificateCardProps {
  certificate: Certificate
  showBorder?: boolean
}

const CertificateCard = ({ certificate, showBorder = false }: CertificateCardProps) => {
  return (
    <div
      className={cn(
        'flex w-80 cursor-pointer flex-row items-center gap-4 rounded-md bg-card px-5 py-5 text-card-foreground transition duration-300 ease-in-out hover:rounded-md hover:shadow-lg hover:shadow-primary hover:outline-none hover:ring-2 hover:ring-ring',
        showBorder && 'border',
      )}
    >
      <div className="group relative flex w-full flex-row items-center">
        <div className="flex w-32 flex-col gap-2">
          <Typography variant="regularText">{certificate.name}</Typography>
          <Typography variant="mutedText">{certificate.artist}</Typography>
          <Typography variant="mutedText">{certificate.year}</Typography>
        </div>
        <div className="grow"></div>
        <div className="flex h-32 w-32 items-center justify-center">
          <img
            className="aspect-square h-full w-full rounded-lg object-cover shadow-lg shadow-primary"
            src={certificate.image}
            alt={certificate.name}
          />
        </div>
      </div>
    </div>
  )
}

export default CertificateCard
