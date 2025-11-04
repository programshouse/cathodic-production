import React from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import PageCard from "../../components/ui/PageCard";
// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import PendingTopics from "../../components/ecommerce/PendingTopics";

export default function Home() {
  return (
    <PageLayout title="Dashboard | CP">
      <PageHeader 
        title="Professional Cathodic Protection Calculator"
        description=" "
      />
      
      <div className="col-span-12 space-y-1 xl:col-span-12">
        {/* <EcommerceMetrics /> */}
      </div>

      <div className="col-span-12">
        {/* <PendingTopics /> */}
      </div>
    </PageLayout>
  );
}
