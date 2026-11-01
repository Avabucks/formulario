// Natural width, capped by the page, centered horizontally
export const ImgComponent = ({ src, alt }: any) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className="block w-auto max-w-full h-auto mx-auto my-6 rounded-lg border border-border"
  />
);
