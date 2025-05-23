import HeaderLogo from '../assets/HeaderLogo.svg'

export const Header = () => {
  return (
    <header>
        <div className="flex justify-between items-center text-white mb-10 pt-4">
            <a href="#" ><img className="w-12" src={HeaderLogo} alt="logo" /></a>
            <div className="flex gap-4">
                <button>
                   <a target="_blank" rel="noopener noreferrer" href="https://github.com/ZanaCRC/DojontDev"><p>Github</p></a> 
                </button>
                
            </div>
        </div>
    </header>
  )
}
