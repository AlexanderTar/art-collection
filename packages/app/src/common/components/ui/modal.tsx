import * as React from 'react'
import * as ModalPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/common/styleUtils'

const Modal = ModalPrimitive.Root

const ModalTrigger = ModalPrimitive.Trigger

const ModalClose = ModalPrimitive.Close

const ModalPortal = ModalPrimitive.Portal

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Overlay
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/30 dark:bg-black/80',
      className,
    )}
    {...props}
    ref={ref}
  />
))
ModalOverlay.displayName = ModalPrimitive.Overlay.displayName

const ModalVariants = cva(
  'bg-background animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0 fixed inset-0 z-50 mx-auto my-auto h-fit max-h-[700px] items-center justify-center overflow-y-auto overflow-x-hidden px-8 py-14 sm:rounded-lg',
  {
    defaultVariants: {
      size: 'lg',
    },
    variants: {
      size: {
        xl: 'max-w-[1000px]',
        lg: 'max-w-[800px]',
        md: 'max-w-[600px]',
        sm: 'max-w-[400px]',
        content: 'max-w-screen',
      },
    },
  },
)

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof ModalPrimitive.Content>,
    VariantProps<typeof ModalVariants> {}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Content>,
  ModalContentProps
>(({ className, children, size, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <ModalPrimitive.Content ref={ref} className={cn(ModalVariants({ size }), className)} {...props}>
      {children}
      <ModalPrimitive.Close className="ring-offset-background hover:bg-muted data-[state=open]:bg-secondary absolute right-4 top-4 rounded-md bg-transparent px-1 py-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none">
        <X className="h-7 w-7" />
        <span className="sr-only">{useTranslation().t('global:close')}</span>
      </ModalPrimitive.Close>
    </ModalPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = ModalPrimitive.Content.displayName

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)
ModalHeader.displayName = 'ModalHeader'

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
ModalFooter.displayName = 'ModalFooter'

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Title
    ref={ref}
    className={cn('text-foreground text-lg font-semibold', className)}
    {...props}
  />
))
ModalTitle.displayName = ModalPrimitive.Title.displayName

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
ModalDescription.displayName = ModalPrimitive.Description.displayName

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}
