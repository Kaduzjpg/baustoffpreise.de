import { z } from 'zod';

export const zipRegex = /^[0-9]{5}$/;

export const lookupQuerySchema = z.object({
  zip: z.string().regex(zipRegex, 'PLZ muss 5-stellig sein'),
  radius: z.coerce.number().int().min(1).max(200),
});

export const inquiryItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive(),
  note: z.string().max(500).optional().or(z.literal('')),
});

export const inquirySchema = z.object({
  customerName: z.string().min(2).max(150),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(50).optional().or(z.literal('')),
  zip: z.string().regex(zipRegex, 'PLZ muss 5-stellig sein'),
  radius: z.coerce.number().int().min(1).max(200),
  note: z.string().max(1000).optional().or(z.literal('')),
  items: z.array(inquiryItemSchema).min(1).max(100),
});

export type LookupQuery = z.infer<typeof lookupQuerySchema>;
export type InquiryPayload = z.infer<typeof inquirySchema>;
export type InquiryItemPayload = z.infer<typeof inquiryItemSchema>;


