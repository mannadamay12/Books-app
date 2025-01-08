// make a fetch request to Google Books API with an isbn number
// return the response as JSON
// export the response
export const getBookByISBN = async (isbn: string) => {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
  return await response.json();
};
