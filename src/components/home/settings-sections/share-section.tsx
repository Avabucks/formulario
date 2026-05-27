import { Qr } from "../../ui/qr";

export function ShareSection({
  link,
  title,
}: Readonly<{ link: string; title: string }>) {
  return <Qr link={link} title={title} />;
}
