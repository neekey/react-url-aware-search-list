import React from 'react';
import { getCountries, ICountry, ICountryFilterOptions } from './countryService';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import SearchForm from './searchForm';
import Pagination from './pagination';
import queryString from 'query-string';

interface IStateTypes {
  list: ICountry[];
  total: number;
}

class URLAwareList extends React.Component<RouteComponentProps, IStateTypes> {
  state = {
    list: [],
    total: 0,
  }
  pageSize: number = 20;
  componentDidMount() {
    console.log('mount');
    this.fetchList();
  }
  componentDidUpdate(prevProps) {
    const { keyword, page } = this.getOptionsFromURL();
    const { keyword: prevKeyword, page: prevPage } = this.getOptionsFromURL(prevProps);

    if (
      keyword !== prevKeyword
      || page !== prevPage
    ) {
      this.fetchList();
    }
  }
  getOptionsFromURL(props: RouteComponentProps = null) {
    const { location: { search } } = props || this.props;
    const query = queryString.parse(search) as Record<string, string>;
    const options: ICountryFilterOptions = { pageSize: this.pageSize };
    if (query.keyword) {
      options.keyword = query.keyword;
    }
    if (query.page) {
      options.page = parseInt(query.page, 10);
    }
    return options;
  }
  fetchList = () => {
    const result = getCountries(this.getOptionsFromURL());
    this.setState({
      list: result.data,
      total: result.total,
    });
  }
  handleKeywordChange = (keyword) => {
    const { history } = this.props;
    history.push(`?keyword=${keyword}&page=1`);
  }
  handlePageChange = (page: number) => {
    const { keyword } = this.getOptionsFromURL();
    const { history } = this.props;
    history.push(`?keyword=${keyword || ''}&page=${page}`);
  }
  handleRandomChangeKeyword = () => {
    const keyword = String.fromCharCode(97 + Math.floor(26 * Math.random()));
    const { history } = this.props;
    history.push(`?keyword=${keyword || ''}&page=1`);
  }
  render() {
    const { list, total } = this.state;
    const { keyword, page } = this.getOptionsFromURL();
    return (
      <div>
        <SearchForm defaultValue={keyword} key={keyword} onSearch={this.handleKeywordChange} />
        <ul>
          {list.map(country => (
            <li key={country.id}>{country.name}</li>
          ))}
        </ul>
        <Pagination
          total={total}
          currentPage={page}
          pageSize={this.pageSize}
          onPageChange={this.handlePageChange} />

        <div>
          <button onClick={this.handleRandomChangeKeyword}>Random Change Keyword in the URL</button>
        </div>
      </div>
    );
  }
}

export default withRouter(URLAwareList);
