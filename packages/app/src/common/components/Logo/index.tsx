import { Link } from 'react-router-dom'
import logo from '@/assets/png/mona-lisa.png'

interface Props {
  to: string
}

const Logo = ({ to }: Props) => {
  return (
    <Link to={to}>
      <div className="flex flex-row gap-2">
        <img src={logo} alt="logo" className="-mt-1 h-9" />
      </div>
    </Link>
  )
}

export default Logo
