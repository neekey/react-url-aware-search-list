import countries from './countries.json';

export interface ICountry {
  id: string;
  name: string;
}

export interface ICountryFilterOptions {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export function getCountries(
  { keyword, page = 1, pageSize = 20 }: ICountryFilterOptions = {}
): { data: ICountry[], total: number } {
  let result = countries as ICountry[];
  if (keyword) {
    result = countries.filter(item => {
      return item.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    });
  }

  const actualPage = page;
  const actualPageSize = pageSize;

  return {
    total: result.length,
    data: result.slice((actualPage - 1) * actualPageSize, actualPage * actualPageSize),
  };
}