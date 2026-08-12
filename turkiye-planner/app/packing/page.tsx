import type { Metadata } from 'next'
import PackingBoard from '@/components/PackingBoard'

export const metadata: Metadata = {
  title: 'Packing List · Türkiye Planner',
  description: 'The official gender-agnostic packing checklist for Istanbul & Bodrum, Aug 21–31, 2026.',
}

export default function PackingPage() {
  return <PackingBoard />
}
