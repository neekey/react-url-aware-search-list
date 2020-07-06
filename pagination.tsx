import React from 'react';
import style from './pagination.css';

console.log('style', style);

interface IPropTypes {
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?(page: number): void;
}

const PageItemStyle = {

}

export default function Pagination({ total = 0, currentPage = 1, pageSize, onPageChange }: IPropTypes) {
  const pageIndexList= [];
  const totalPage = Math.ceil(total / pageSize);
  for (let pageIndex = 1; pageIndex <= totalPage; pageIndex++) {
    pageIndexList.push(pageIndex);
  }
  return (
    <ul className="pagination">
      {pageIndexList.map(pageIndex => (
        <li
          key={pageIndex}
          className={`pagination--item ${pageIndex} ${currentPage === pageIndex ? 'pagination--item-current' : ''}`}
          onClick={
            currentPage === pageIndex
              ? null
              : () => onPageChange(pageIndex)
          }>{pageIndex}</li>
      ))}
    </ul>
  )
}