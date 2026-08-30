import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/questions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello questions</div>
}
