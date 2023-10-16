import { getPlaiceholder } from 'plaiceholder';
import type { Photo, ImagesResults } from '@/models/Images';

async function getBase64(imageUrl: string) {
  try {
    const res = await fetch(imageUrl);

    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);

    const buffer = await res.arrayBuffer();
    
    const { base64 } = await getPlaiceholder(Buffer.from(buffer));

    return base64;
  } catch (error) {
    if (error instanceof Error) console.log(error.stack);
  }
}

export default async function addBlurredDataUrls(images: ImagesResults): Promise<Photo[]> {
  // Thực hiện tất cả các yêu cầu cùng lúc thay vì đợi từng yêu cầu - tránh mô hình thứ tự (waterfall).
  const base64Promises = images.photos.map((photo) => getBase64(photo.src.large));

  // Giải quyết tất cả các yêu cầu theo thứ tự.
  const base64Results = await Promise.all(base64Promises);

  const photosWithBlur: Photo[] = images.photos.map((photo, i) => {
    photo.blurredDataUrl = base64Results[i];
    return photo;
  });

  return photosWithBlur;
}
