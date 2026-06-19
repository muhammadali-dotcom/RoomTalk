import { redirect } from 'next/navigation';

// Legacy /rooms route — redirects to the real dashboard
export default function RoomsPage() {
  redirect('/dashboard');
}
