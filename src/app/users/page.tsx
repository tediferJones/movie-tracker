import GetBreadcrumbs from '@/components/getBreadcrumbs';

export default function Users() {
  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{ home: '/', users: '/users' }}/>
      <div>Display a list of all users</div>
    </div>
  )
}
