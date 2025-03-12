import React from "react";
import PageContainer from "../components/layout/PageContainer";
import ComponentManager from "../components/ComponentManager";

/**
 * Component Manager Page
 *
 * This page provides an interface for evaluating and absorbing components
 * into the OSPAiN2 ecosystem.
 */
const ComponentManagerPage: React.FC = () => {
  return (
    <PageContainer
      title="Component Manager"
      description="Evaluate and absorb components into the OSPAiN2 ecosystem"
    >
      <ComponentManager />
    </PageContainer>
  );
};

export default ComponentManagerPage;
