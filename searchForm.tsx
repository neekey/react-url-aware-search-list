import React, { useState } from 'react';

interface IPropTypes {
  defaultValue?: string;
  onSearch?(keyword?: string): void;
}

export default function SearchForm({ defaultValue, onSearch }: IPropTypes) {
  const [keyword, setKeyword] = useState(defaultValue);
  return (
    <form
      onReset={() => {
        if (onSearch) {
          onSearch('');
        }
      }}
      onSubmit={e => {
        e.preventDefault();
        if (onSearch) {
          onSearch(keyword);
        }
    }}> 
      <input defaultValue={defaultValue} type="text" onChange={e => setKeyword(e.target.value)} />
      <button type="submit">Search</button>
      <button type="reset">Clear</button>
    </form>
  );
}