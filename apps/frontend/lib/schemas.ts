import { z } from 'zod'

export const QuoteItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive(),
  note: z.string().optional().default(''),
})

export const QuoteCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  zip: z.string().regex(/^\d{5}$/),
})

export const QuoteSubmitSchema = z.object({
  customer: QuoteCustomerSchema,
  items: z.array(QuoteItemSchema).min(1),
  radiusKm: z.number().int().positive().max(200).default(50),
})

export type QuoteSubmit = z.infer<typeof QuoteSubmitSchema>
