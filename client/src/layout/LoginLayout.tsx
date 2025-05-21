import { Outlet } from "react-router-dom"

export const LoginLayout = () => {
  return (
    <main className=" flex max-w-5xl mx-auto p-4">
        <Outlet />
    </main>
  )
}

export default LoginLayout;
