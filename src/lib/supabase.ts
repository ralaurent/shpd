// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to upload Base64 images to Supabase Storage
export async function uploadBase64Image(base64Str: string, fileName: string): Promise<string> {
    const res = await fetch(base64Str);
    const blob = await res.blob();

    const { data, error } = await supabase.storage
        .from('patient-images')
        .upload(`progress/${fileName}-${Date.now()}.jpg`, blob, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('patient-images')
        .getPublicUrl(data.path);

    return publicUrl;
}