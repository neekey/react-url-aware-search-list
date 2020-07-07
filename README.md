# React Use Case: URL-Aware Search List

This project is to showcase a common use case in React web application that a list page with search and pagination while their state needs to be sync with the page URL query.

## Features

- User can use the search input to type in keyword and hit enter or click "search" to trigger a list search.
- The list result should be rendered together with pagination, which allows user to navigate to different pages.
- when user trigger a new keyword search, page needs to be rest to 0
- the search keyword and page number all needs to be synced to the page url. When user reload the page, the keyword and selected page should remain (the search input needs to be prefilled and specified page link is selected).
- when a URL changed by other modules that is not the pagination and search input, the pagination and search should reflext the change from the URL.

## Fully Controlled

If we look at this project from a higher level, the whole page should be treated as a fully controlled component.

The URL query string is the source of the truth:

- when page first load, the URL's query represent the initial state
- anytime a keyword or page number changes, the change will be made to the URL, the URL change will then be detected and become a props change by the react-router.

so the data flow will be:

```
user interactions -> page URL query changes -> route props changes -> UI updates accordingly.
```

Let's break them down part by part.

### User Interactions

There are several different user interactions in this use case, some of them are more complicated then others but in general, they all surve the purposs of yield out a event to trigger the URL query to be updated.

#### Keyword Search

The most straightforward way of implementing a fulling controlled search input will be:

```jsx
handleKeywordChange(e) {
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

The code above will serve the purpose well as syncing the search input with the page URL, yet it is not a natural user experience. When user types to search, it probably a better idea to trigger a new search when user click the "search" button or hit enter, and it makes sense we only update URL when user decides to do a new search.

At the same time, user should be freely type into text and the input value should update while user type. That means the input element needs to be uncontrolled, at least not fully controlled.

To wrap up this extral logic and store the temporary user input before being triggered for a search, we can create a new separate component to replace the simple `<input />`:


```jsx
handleKeywordChange(keyword) {
  history.push(`?keyword=${keyword}`);
}

render() {
  return (
    <Search onSearch={handleKeywordChange} />
  );
}
```

Regardless the internal implemetation details about `<Search />`, it should allows user to type freely and only trigger `onSearch` when user click a "search" button.

One thing still missing here is that this component is not controlled anymore. For example, when user visit `?keyword=hello` for the first time, the `<Search />` component won't be able to prefill its value to `hello`. To solve that, we can simply add a `defaultValue` propperty:

```jsx
const { location: { query } } = this.props;
return (
  <Search onSearch={handleKeywordChange} defaultValue={query.keyword} />
);
```

It should work well now. User types in words, hits "search", the page URL shall be updated. If user then refresh the page, the keyword that they typed in before shall be prepopulated from the URL.

Except the `<Search />` is still not controlled.

What if there is a "people also searchs" section in the page, proving quick hot keywords, so that users can simply click them and whatever keyword they click will be automatically fill into the `<Search />` component? 

You might think about doing this immediately:

```
<Search onSearch={handleKeywordChange} value={query.keyword} />
```

which definitely serves the "people also searchs" feature above as now `<Search />` becomes a fully controlled component, but the issue of that has been mentioned earlier, we lost the "free typing and trigger search later" experience.

What we actually need here is something half way between a not controlled component and a fully controlled component:

- the component's value is not fully controlled so that its value can be different than the extrnal value
- the component can still trigger callback for it's value change (whoever is handling the callback can use the value as they feel pleased)
- whenever the component's value needs to be synced to the extrnal value, there need a way to do so.

Ok, the above sounds complicated altogether, but the solution is simple, we can just combine `defaultValue` and `key`:

```
<Search onSearch={handleKeywordChange} defaultValue={query.keyword} key={query.keyword} />
```

## Edge cases error handling

## User Case based components

To solve the difficulty of complicated user case reuse.

