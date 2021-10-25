export type ISearchName = string & { type: "SearchName" };

export const toSearchName = (searchName?: string | null) => {
  return (searchName?.trim() ?? "") as ISearchName;
};
