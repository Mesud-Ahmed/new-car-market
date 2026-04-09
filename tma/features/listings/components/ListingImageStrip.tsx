interface ListingImageStripProps {
  alt: string;
  photos: string[];
}

export function ListingImageStrip({ alt, photos }: ListingImageStripProps) {
  return (
    <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
      {photos.slice(0, 4).map((photo, index) => (
        <img key={index} src={photo} alt={alt} className="h-64 w-full flex-shrink-0 object-cover snap-center" />
      ))}
    </div>
  );
}
