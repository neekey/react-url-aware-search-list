# React Use Case: URL-Aware Search List

This project is to showcase a common use case in React web application that a list page with search and pagination while their state needs to be sync with the page URL query.

## Features

- User can use the search input to type in keyword and hit enter or click "search" to trigger a list search.
- The list result should be rendered together with pagination, which allows user to navigate to different pages.
- when user trigger a new keyword search, page needs to be rest to 0
- the search keyword and page number all needs to be synced to the page url. When user reload the page, the keyword and selected page should remain (the search input needs to be prefilled and specified page link is selected).
- when a URL changed by other modules that is not the pagination and search input, the pagination and search should reflext the change from the URL.

## Summary

If we look at this project from a higher level, the whole page should be treated as a fully controlled component.

The URL query string is the source of the truth:

- when page first load, the URL's query represent the initial state
- anytime a keyword or page number changes, the change will be made to the URL, the URL change will then be detected and become a props change by the react-router.

so the data flow will be:

```
user interactions -> page URL query changes -> route props changes -> UI updates accordingly.
```


## Keyword Search

Keyword Search is the most trickies part. Even though the higher scale sounds like a "fulling controlled component" model, the Keyword Search component behavior lies somewhere in the middle:

- 1) It needs to respond to the change of the URL Query:
  - 1.1) when the page first load
  - 1.2) when the page URL Query is changed by other components
- 2) It needs to manage its keyword value and only trigger the "change" event when user wants to search.

To implement 1) we have the [Controlled Component](https://reactjs.org/docs/forms.html#controlled-components), for example:

```jsx
handleKeywordChange = (keyword) => {
  const { history } = this.props;
  const keyword = e.target.value;
  history.push(`?keyword=${keyword}`);
}

render() {
  const { location: { query } } = this.props;
  return (
    <input type="text" value={query.keyword} onChange={this.handleKeywordChange}>
  );
}
```

The code above will serve the requirement 1) very well. The keyword in the search input will always be synced to the page URL query.

Yet it is not a good user experience. When users type to search, it usually a better idea to trigger a new search when users are ready for making change by click the "search" button or hit enter. Users should be able to freely type into text and the input value should update while users type.

That means the input element needs to be uncontrolled, at least not fully controlled, which is what the 2) requires.

To wrap up this extral logic and store the temporary user input before being triggered for a search, we can create a new separate component to replace the simple `<input />`:

```jsx
handleKeywordChange = (keyword) => {
  const { history } = this.props;
  history.push(`?keyword=${keyword}`);
}

render() {
  const { location: { query } } = this.props;
  return (
    <Search onSearch={handleKeywordChange} defaultValue={query.keyword} />
  );
}
```

This version should work quite well now.

Users type in words, hits "search", the page URL shall be updated. If users then refresh the page, the keyword that they typed in before shall be prepopulated from the URL.

Except it does not meet the requirement of 1.2).

Imagine if there is a "people also searchs" section in the page, providing quick hot keywords, so that users can simply click them to search, the code might look like this:

```jsx
handleKeywordChange = (keyword) => {
  const { history } = this.props;
  history.push(`?keyword=${keyword}`);
}

render() {
  const { location: { query } } = this.props;
  return (
    <div>
      <Search onSearch={this.handleKeywordChange} defaultValue={query.keyword} />
      <HotKeywords onSelect={this.handleKeywordChange} />
    </div>
  );
}
```

As we know, `[defaultValue](https://reactjs.org/docs/uncontrolled-components.html#default-values)` works as the initial value when the component first rendered and the value will be ignore afterwards. That means after the page loads, later on when users click the keywords on `<HotKeywords />`, which triggers the `query.keyword` changes in `this.props` through the page url query change, the new `query.keyword` will not be reflected on the `<Search />` component.

What can we do?

### "Key" is the key.

Our issue above is mainly about the `defaultValue` does not work after the components initial rendering. What if we can force the component to remount itself? The answer here is the `key` attribute.

`key` is mostly used in the use case of rendering a list by assigning each item a unique `key` as "id" which helps React identify which items have changed, are added, or are removed. So in our case if we assign a different key to our `<Search />` component, React will think that the component with the old `key` needs to be removed and a new component with a new `key` needs to be added, which in another word is called `remount`.

Which `key` should we use? The `query.keyword` that we want to assign to `defaultValue`.

```
<Search onSearch={handleKeywordChange} defaultValue={query.keyword} key={query.keyword} />
```

## Loading List

Same as the componets, when loading data, the parameters should always get from the page URL query straight away:

```
loadList = async () => {
  const { location: { query } } = this.props;
  this.setState({
    loading: true,
  });
  // assume `services` is a module for the data layer. 
  const result = services.loadList({
    keyword: query.keyword,
    page: query.page,
  });
  this.setState({
    loading: false,
    list: result.data,
    total: result.total,
  });
}
```

this will make sure the list result always align with the page URL.

Except for how we also need to be clear about when to load the list:

- when the page first loads
- when the page URL query changes

So we will use the `loadList` like below:

```
componentDidMount() {
  this.loadList();
}

componentDidUpdate(prevProps) {
  const { location: { query } } = this.props;
  const { location: { query as oldQuery } } = prevProps;
  if (query.keyword !== oldQuery.keyword || query.page !== oldQuery.page) {
    this.loadList();
  }
}
```

## Pagination

Pagination will be just a simple fully controlled component:

```
...
handlePageChange = (page) => {
  const { location: { query } } = this.props;
  const { history } = this.props;
  history.push(`?keyword=${query.keyword}&page=${page}`);
}
...
const { location: { query } } = this.props;
const { total } = this.state;
...
<Pagination total={total} pageSize={20} page={query.page} onPageChange={this.handlePageChange} />
```
## Altogether

```
class URLAwareSearchList extends React.Component {
  state = {
    data: [],
    total: 0,
    loading: true,
  }
  
  componentDidMount() {
    this.loadList();
  }

  componentDidUpdate(prevProps) {
    const { location: { query } } = this.props;
    const { location: { query as oldQuery } } = prevProps;
    if (query.keyword !== oldQuery.keyword || query.page !== oldQuery.page) {
      this.loadList();
    }
  }
  
  handlePageChange = (page) => {
    const { location: { query } } = this.props;
    const { history } = this.props;
    history.push(`?keyword=${query.keyword}&page=${page}`);
  }
  
  handleKeywordChange = (keyword) => {
    const { history } = this.props;
    history.push(`?keyword=${keyword}`);
  }
  
  render() {
    const { location: { query } } = this.props;
    const { loading, data, total } = this.state;
    return (
      <div>
        <Search onSearch={this.handleKeywordChange} defaultValue={query.keyword} />
        <HotKeywords onSelect={this.handleKeywordChange} />
        <DataList data={data} loading={loading} />
        <Pagination total={total} pageSize={20} page={query.page} onPageChange={this.handlePageChange} /> 
      </div>
    );
  }
}
```
