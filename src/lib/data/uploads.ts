import { createClient } from "@/lib/supabase/client";

export const MAX_BODY_PHOTO_SIZE = 6 * 1024 * 1024;
export const BODY_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateBodyPhoto(file: File) {
  if (!BODY_PHOTO_TYPES.includes(file.type)) {
    return "Envie uma imagem em JPG, PNG ou WebP.";
  }

  if (file.size > MAX_BODY_PHOTO_SIZE) {
    return "A imagem deve ter no máximo 6 MB.";
  }

  return null;
}

export async function uploadBodyPhoto(
  userId: string,
  file: File,
  side: "front" | "back"
) {
  const validation = validateBodyPhoto(file);
  if (validation) throw new Error(validation);

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${side}.${extension}`;

  const { data, error } = await supabase.storage
    .from("body-photos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("body-photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
