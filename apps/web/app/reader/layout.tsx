import { ReaderHeader } from '@/components/reader-shell';

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return <><ReaderHeader />{children}</>;
}
