import { Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { Loading, Layout } from '@/common/components'
import ConnectButton from '@/common/components/ConnectButton'
import { APP_ROUTES } from '@/app/routes/app'
import { useAuth } from '@/common/auth'
import NewCertificate from './features/certificates/pages/NewCertificate'
import MyCertificates from './features/certificates/pages/MyCertificates'
import CertificateDetails from './features/certificates/pages/CertificateDetails'
import { useTranslation } from 'react-i18next'

const Dashboard = () => {
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()

  return (
    <Routes>
      <Route
        element={
          <Layout
            headerProps={{
              baseUrl: APP_ROUTES.index.to,
              links: [
                ...[{ to: APP_ROUTES.new.to, label: t('dashboard:header.new') }],
                ...(isLoggedIn
                  ? [{ to: APP_ROUTES.certificates.to, label: t('dashboard:header.my') }]
                  : []),
              ],
              endSlot: (
                <>
                  <ConnectButton />
                </>
              ),
            }}
          >
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </Layout>
        }
      >
        <Route index element={<NewCertificate />} />
        <Route path={APP_ROUTES.certificates.path} element={<MyCertificates />} />
        <Route path={APP_ROUTES.new.path} element={<NewCertificate />} />
        <Route path={APP_ROUTES.details.path} element={<CertificateDetails />} />
        <Route path="*" element={<Navigate replace to={APP_ROUTES.index.to} />} />
      </Route>
    </Routes>
  )
}

export default Dashboard
