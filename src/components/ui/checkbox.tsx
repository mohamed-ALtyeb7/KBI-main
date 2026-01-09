'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer bg-white/5 text-white size-6 shrink-0 rounded-full border-2 border-white/20 shadow-xs transition-[border,background-color] outline-none hover:border-cyan-400 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-black',
        className,
      )}
      {...props}
    >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current transition-none"
    >
      <CheckIcon className="size-4" />
    </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
