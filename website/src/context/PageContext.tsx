import React, { createContext, useContext, useState } from 'react';

type Page = 'home' | 'find-url' | 'instant';

const PageContext = createContext<{
  page: Page;
  setPage: (page: Page) => void;
  blogOnly: boolean;
  setBlogOnly: (v: boolean) => void;
}>({ page: 'home', setPage: () => null, blogOnly: false, setBlogOnly: () => null });

export function usePageContext() {
  return useContext(PageContext);
}

export function PageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [page, setPage] = useState<Page>('home');
  const [blogOnly, setBlogOnly] = useState(false);

  return (
    <PageContext.Provider value={{ page, setPage, blogOnly, setBlogOnly }}>
      {children}
    </PageContext.Provider>
  );
}
