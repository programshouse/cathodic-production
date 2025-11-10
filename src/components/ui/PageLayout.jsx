import React from "react";
import PageMeta from "../common/PageMeta";

// full width by default; set fullBleed to true to break out of parent padding/containers
const PageLayout = ({
  title,
  description,
  children,
  className = "",
  fullBleed = false,
}) => {
  // Base full-width grid
  const base =
    "w-full max-w-none grid grid-cols-12 gap-4 md:gap-6 p-6";

  // When you need truly edge-to-edge (ignore parent paddings/containers)
  // we use the classic full-bleed trick: stretch to viewport width and offset margins.
  const bleed = fullBleed
    ? "w-screen relative left-1/2 right-1/2 -mx-[50vw]"
    : "";

  return (
    <div className={[base, bleed, className].filter(Boolean).join(" ")}>
      <PageMeta title={title} description={description} />
      {children}
    </div>
  );
};

export default PageLayout;
