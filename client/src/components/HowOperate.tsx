export const HowOperate = () => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 py-12 z-10 mb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-transparent opacity-20 pointer-events-none" />
      
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#4F7CEC] to-[#e9d4ff] w-auto min-h-[100px]">
        How Does It Work?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Game Flow Column */}
        <div className="relative overflow-hidden rounded-xl border border-gray-50/[.1] bg-gray-50/[.02] backdrop-blur-sm p-8 hover:bg-gray-50/[.05] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CEC]/10 to-transparent opacity-20" />
          <h3 className="text-2xl font-semibold mb-6 text-[#4F7CEC]">Game Flow</h3>
          <ul className="space-y-6">
            <li className="relative rounded-xl border border-[#4F7CEC]/20 bg-[#4F7CEC]/5 p-4 transition-all duration-300 hover:bg-[#4F7CEC]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F7CEC]/20 text-[#4F7CEC] font-semibold">1</span>
                <p className="text-gray-200 pt-1">Register with your verified wallet on your device, completely anonymous and secure</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#4F7CEC]/20 bg-[#4F7CEC]/5 p-4 transition-all duration-300 hover:bg-[#4F7CEC]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F7CEC]/20 text-[#4F7CEC] font-semibold">2</span>
                <p className="text-gray-200 pt-1">Select the amount to pay to play in the PVP tournament and create the battle</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#4F7CEC]/20 bg-[#4F7CEC]/5 p-4 transition-all duration-300 hover:bg-[#4F7CEC]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F7CEC]/20 text-[#4F7CEC] font-semibold">3</span>
                <p className="text-gray-200 pt-1">Pay the entry fee and compete against other players when matching with them</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#4F7CEC]/20 bg-[#4F7CEC]/5 p-4 transition-all duration-300 hover:bg-[#4F7CEC]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F7CEC]/20 text-[#4F7CEC] font-semibold">4</span>
                <p className="text-gray-200 pt-1">Win matches and accumulate points in the ranking</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#4F7CEC]/20 bg-[#4F7CEC]/5 p-4 transition-all duration-300 hover:bg-[#4F7CEC]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F7CEC]/20 text-[#4F7CEC] font-semibold">5</span>
                <p className="text-gray-200 pt-1">Reach the finals and compete for bigger prizes</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Revenue Model Column */}
        <div className="relative overflow-hidden rounded-xl border border-gray-50/[.1] bg-gray-50/[.02] backdrop-blur-sm p-8 hover:bg-gray-50/[.05] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#9c40ff]/10 to-transparent opacity-20" />
          <h3 className="text-2xl font-semibold mb-6 text-[#9c40ff]">Revenue Model</h3>
          <ul className="space-y-6">
            <li className="relative rounded-xl border border-[#9c40ff]/20 bg-[#9c40ff]/5 p-4 transition-all duration-300 hover:bg-[#9c40ff]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c40ff]/20 text-[#9c40ff] font-semibold">💰</span>
                <p className="text-gray-200 pt-1">(Coming Soon) Tournament entry fees (from $5 to $50)</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#9c40ff]/20 bg-[#9c40ff]/5 p-4 transition-all duration-300 hover:bg-[#9c40ff]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c40ff]/20 text-[#9c40ff] font-semibold">🏆</span>
                <p className="text-gray-200 pt-1">10% commission on distributed prizes</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#9c40ff]/20 bg-[#9c40ff]/5 p-4 transition-all duration-300 hover:bg-[#9c40ff]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c40ff]/20 text-[#9c40ff] font-semibold">⭐</span>
                <p className="text-gray-200 pt-1">Premium memberships with exclusive benefits</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#9c40ff]/20 bg-[#9c40ff]/5 p-4 transition-all duration-300 hover:bg-[#9c40ff]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c40ff]/20 text-[#9c40ff] font-semibold">🎮</span>
                <p className="text-gray-200 pt-1">(Coming Soon) Sale of cosmetic items and customizations</p>
              </div>
            </li>
            <li className="relative rounded-xl border border-[#9c40ff]/20 bg-[#9c40ff]/5 p-4 transition-all duration-300 hover:bg-[#9c40ff]/10">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c40ff]/20 text-[#9c40ff] font-semibold">🤝</span>
                <p className="text-gray-200 pt-1">Gaming brand sponsorships and advertising</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
