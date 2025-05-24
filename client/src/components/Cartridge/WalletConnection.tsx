import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import { useEffect, useState } from 'react'
import ControllerConnector from '@cartridge/connector/controller'
import { Button } from '@cartridge/ui-next'
 
export function ConnectWallet() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const controller = connectors[0] as ControllerConnector
  const [username, setUsername] = useState<string>()
 
  useEffect(() => {
    if (!address) return
    controller.username()?.then((n) => setUsername(n))
  }, [address, controller])
 
  return (
    <div className="controller-connect-container flex flex-col items-center">
      {address && (
        <>
          <p className="text-neutral-900">Account: {address}</p>
          {username && <p className="text-neutral-900">Username: {username}</p>}
        </>
      )}
      {address ? (
        <Button className="px-4 py-2 transition-all  group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px30px#a21caf] duration-500 before:duration-500 hover:duration-500 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline-offset-4  origin-left hover:decoration-2 hover:text-black hover:cursor-pointer relative bg-transparent h-16 w-64 border p-3 text-neutral-700 text-2xl font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-[-2] before:bg-red-500 before:rounded-full before:blur-lg  after:absolute after:z-[-2] after:w-20 after:h-20 after:content['']  after:bg-yellow-300 after:right-8 after:top-3 after:rounded-full after:blur-lg text-center" onClick={() => disconnect()}>Disconnect</Button>
      ) : (
        <Button className = "px-4 py-2 transition-all group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px30px#a21caf] duration-500 before:duration-500 hover:duration-500 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline-offset-4  origin-left hover:decoration-2 hover:text-black hover:cursor-pointer relative bg-transparent h-16 w-64 border p-3 text-neutral-700 text-2xl font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-[-2] before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-[-2] after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg text-center" onClick={() => connect({ connector: controller })}>
          Connect
        </Button>
      )}
    </div>
  )
}