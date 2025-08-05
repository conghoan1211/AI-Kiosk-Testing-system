import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Page404 from '@/pages/Page404';
import routes from '@/routes/routes';
import PrivateRoute from '@/components/PrivateRoute';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import Loading from './components/ui/loading';
import { toastCloseIcons, toastContainer, toastIcons } from './helpers/toast';
import i18n from './i18n/config';
import AuthenticationProvider from './providers/AuthenticationProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { useGet } from './stores/useStores';

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

const App = () => {
  const loadingApp = useGet('loadingApp');

  const renderContent = React.useMemo(() => {
    return (
      <Routes>
        {routes.map((route) => (
          <Route
            key={`${route.path}-layout`}
            path={route.path}
            element={
              route.isPrivateRoute ? (
                <PrivateRoute>
                  <route.layout>
                    <Outlet />
                  </route.layout>
                </PrivateRoute>
              ) : (
                <route.layout>
                  <Outlet />
                </route.layout>
              )
            }
          >
            {route.routeChild.map((child, idx) => (
              <Route
                key={`${child.path}-${idx}`}
                path={child.path}
                element={
                  child.isPrivateRoute ? (
                    <PrivateRoute>
                      <Suspense fallback={<Loading />}>
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <child.component />
                        </ErrorBoundary>
                      </Suspense>
                    </PrivateRoute>
                  ) : (
                    <Suspense fallback={<Loading />}>
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <child.component />
                      </ErrorBoundary>
                    </Suspense>
                  )
                }
              />
            ))}
          </Route>
        ))}
        <Route path="*" element={<Page404 />} />
      </Routes>
    );
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <Router>
          <AuthenticationProvider>
            {renderContent}
            <ToastContainer
              position="top-center"
              theme="light"
              toastClassName={(context) =>
                toastContainer[
                  context?.type && context.type in toastContainer ? context.type : 'default'
                ] +
                ' relative flex justify-between items-center py-1 rounded pl-4 pr-1 gap-3 py-1 border'
              }
              icon={(context) => (
                <img
                  src={
                    toastIcons[
                      context.type && context.type in toastIcons ? context.type : 'default'
                    ]
                  }
                  alt="icons"
                />
              )}
              closeButton={(context) => (
                <img
                  src={
                    toastCloseIcons[
                      context.type && context.type in toastCloseIcons ? context.type : 'default'
                    ]
                  }
                  alt="icons"
                  onClick={context.closeToast}
                />
              )}
            />
            {loadingApp && <Loading />}
          </AuthenticationProvider>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
