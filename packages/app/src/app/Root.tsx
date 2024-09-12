import { Suspense } from 'react'

import { Loading } from '@/common/components'
import { Toaster } from '@/common/components/ui/sonner'

import Query from './providers/Query'
import Router from './providers/Router'
import App from './App'
import QueryParamsProvider from './providers/QueryParams'

import '@/i18n'

import WalletProvider from './providers/Wallet'
import GlobalErrorBoundary from './GlobalErrorBoundary'

const Root = () => (
  <GlobalErrorBoundary>
    <TailwindIndicator />
    <Suspense fallback={<Loading />}>
      <Toaster />
      <Query>
        <Router>
          <QueryParamsProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </QueryParamsProvider>
        </Router>
      </Query>
    </Suspense>
  </GlobalErrorBoundary>
)

export default Root

const TailwindIndicator = () =>
  import.meta.env.PROD ? null : (
    <div className="font-mono fixed bottom-3 left-24 z-50 flex size-14 items-center justify-center rounded-full bg-gray-800 text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block 3xl:hidden">2xl</div>
      <div className="hidden 3xl:block 4xl:hidden">3xl</div>
      <div className="hidden 4xl:block">4xl</div>
    </div>
  )
