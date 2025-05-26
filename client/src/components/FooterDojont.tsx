import { Link } from "react-router-dom";

export const FooterDojont = () => {
  return (
    <footer className="relative w-full bg-gray-950/30 backdrop-blur-sm border-t border-gray-50/[.1] mt-32">
      <div className="absolute inset-0 bg-gradient-to-t from-[#4F7CEC]/5 to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4F7CEC] to-[#e9d4ff]">
              DojontDev
            </h3>
            <p className="text-gray-400 max-w-sm">
              The ultimate arena where gaming meets the power of blockchain.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-4 z-50">
            <h4 className="text-lg font-semibold text-[#4F7CEC]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#4F7CEC] transition-colors">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#4F7CEC] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social y Contacto */}
          <div className="space-y-4 z-50">
            <h4 className="text-lg font-semibold text-[#4F7CEC]">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-50/[.05] hover:bg-[#4F7CEC]/10 flex items-center justify-center text-gray-400 hover:text-[#4F7CEC] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-50/[.05] hover:bg-[#4F7CEC]/10 flex items-center justify-center text-gray-400 hover:text-[#4F7CEC] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-50/[.05] hover:bg-[#4F7CEC]/10 flex items-center justify-center text-gray-400 hover:text-[#4F7CEC] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 pt-8 border-t border-gray-50/[.1] z-50">
          <h4 className="text-lg font-semibold text-center text-[#4F7CEC] mb-6">Built With</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-50/[.02] rounded-lg p-3 border border-gray-50/[.1] hover:bg-[#4F7CEC]/5 transition-all">
              <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/react-colored.svg" className="w-6 h-6" alt="React" />
              <span className="text-gray-400">React</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50/[.02] rounded-lg p-3 border border-gray-50/[.1] hover:bg-[#4F7CEC]/5 transition-all">
              <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/typescript-colored.svg" className="w-6 h-6" alt="TypeScript" />
              <span className="text-gray-400">TypeScript</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50/[.02] rounded-lg p-3 border border-gray-50/[.1] hover:bg-[#4F7CEC]/5 transition-all">
              <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/tailwindcss-colored.svg" className="w-6 h-6" alt="Tailwind" />
              <span className="text-gray-400">Tailwind</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50/[.02] rounded-lg p-3 border border-gray-50/[.1] hover:bg-[#4F7CEC]/5 transition-all">
              <img src="https://raw.githubusercontent.com/starknet-io/starknet-website/master/public/favicon-32x32.png" className="w-6 h-6" alt="Starknet" />
              <span className="text-gray-400">Starknet</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-50/[.1] text-center text-gray-400">
          <p>© 2024 DojontDev. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
