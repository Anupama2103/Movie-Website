import React from 'react'

function Search({search, setSearch}) {


  return (
    <div className='search'>
        <div>
            <img src="/src/assets/search.svg" alt="Search" />
            <input 
      type="text" 
      placeholder='Search the movie ...' 
      value={search} 
      onChange={(e) => setSearch(e.target.value)}/>
   
        </div>
       </div>
  )
}

export default Search
