import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  
  // This won't be rendered
  return null;
}
