function Footer() {
    return (
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-red-500">
                <span className="text-2xl">P</span>oké<span className="text-2xl">P</span>lay
              </h3>
              <p className="text-gray-400 text-sm mt-1">A card-based Pokémon battle game</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-gray-400 text-sm">
                Powered by{" "}
                <a
                  href="https://pokeapi.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  PokéAPI
                </a>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                &copy; {new Date().getFullYear()} PokéPlay. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  export default Footer
  