// @ts-nocheck
import GlobalContexts from 'contexts/globalContexts';
import { BridgePage, SendPage, StakePage } from 'pages';
import { CalamariBasePage, DolphinBasePage } from 'pages/BasePage';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';

const DolphinRoutes = () => {
  return (
    <DolphinBasePage>
      <Routes>
        <Route path="dolphin">
          <Route index element={<Navigate to="transact" />} />
          <Route path="bridge" element={<BridgePage />} exact />
          <Route path="transact" element={<SendPage />} exact />
        </Route>
      </Routes>
    </DolphinBasePage>
  );
};

const CalamariRoutes = () => {
  return (
    <CalamariBasePage>
      <Routes>
        <Route path="calamari">
          <Route index element={<Navigate to="transact" />} />
          <Route path="bridge" element={<BridgePage />} exact />
          <Route path="transact" element={<SendPage />} exact />
          <Route path="stake" element={<StakePage />} exact />
        </Route>
      </Routes>
    </CalamariBasePage>
  );
};

const RedirectRoutes = () => {
  return (
    <Routes>
      <Route
        index
        element={<Navigate to="/calamari/transact" replace />}
        exact
      />
      <Route
        path="/stake"
        element={<Navigate to="/calamari/stake" replace />}
        exact
      />
    </Routes>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <GlobalContexts>
        <RedirectRoutes />
        <CalamariRoutes />
        <DolphinRoutes />
      </GlobalContexts>
    </Router>
  );
};

export default AppRouter;
